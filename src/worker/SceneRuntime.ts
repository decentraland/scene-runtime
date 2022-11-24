import { LoadableApis } from "./client"
import { componentSerializeOpt, initMessagesFinished, numberToIdStore, resolveMapping } from "./Utils"
import { customEval, prepareSandboxContext } from "./sandbox"
import { RpcClient } from "@dcl/rpc/dist/types"
import { PermissionItem } from "@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen"

import { createDecentralandInterface, DecentralandInterfaceOptions } from "./runtime/DecentralandInterface"
import { setupFpsThrottling } from "./runtime/SetupFpsThrottling"

import { DevToolsAdapter } from "./runtime/DevToolsAdapter"
import { RuntimeEventCallback, RuntimeEvent, SceneRuntimeEventState, EventDataToRuntimeEvent } from "./runtime/Events"
import type { Scene } from "@dcl/schemas/dist/platform/scene/index"
import { createRuntime } from "./sdk7-runtime"

/**
 * Converts a string position "-1,5" => { x: -1, y: 5 }
 */
function parseParcelPosition(position: string) {
  const [x, y] = position
    .trim()
    .split(/\s*,\s*/)
    .map(($) => parseInt($, 10))
  return { x, y }
}

export async function startSceneRuntime(client: RpcClient) {
  const workerName = self.name
  const clientPort = await client.createPort(`scene-${workerName}`)

  const [EngineApi, EnvironmentApi, Permissions, DevTools] = await Promise.all([
    LoadableApis.EngineApi(clientPort),
    LoadableApis.EnvironmentApi(clientPort),
    LoadableApis.Permissions(clientPort),
    LoadableApis.DevTools(clientPort),
  ])

  const [canUseWebsocket, canUseFetch] = (
    await Permissions.hasManyPermissions({
      permissions: [PermissionItem.PI_USE_WEBSOCKET, PermissionItem.PI_USE_FETCH],
    })
  ).hasManyPermission

  const devToolsAdapter = new DevToolsAdapter(DevTools)
  const eventState: SceneRuntimeEventState = { allowOpenExternalUrl: false }
  const onEventFunctions: RuntimeEventCallback[] = []
  const onUpdateFunctions: ((dt: number) => Promise<void> | void)[] = []
  const onStartFunctions: (() => Promise<void> | void)[] = []
  const batchEvents: DecentralandInterfaceOptions["batchEvents"] = {
    events: [],
  }

  const bootstrapData = await EnvironmentApi.getBootstrapData({})
  const fullData: Scene = JSON.parse(bootstrapData.entity?.metadataJson || "{}")
  const isPreview = await EnvironmentApi.isPreviewMode({})
  const unsafeAllowed = await EnvironmentApi.areUnsafeRequestAllowed({})

  const explorerConfiguration = await EnvironmentApi.getExplorerConfiguration({})

  if (!fullData || !fullData.main) {
    throw new Error(`No boostrap data`)
  }

  // TODO: https://github.com/decentraland/sdk/issues/471
  const IS_SDK7 = "ecs7" in fullData || false

  const mappingName = fullData.main
  const mapping = bootstrapData.entity?.content.find(($) => $.file === mappingName)

  if (!mapping) {
    await EngineApi.sendBatch({ actions: [initMessagesFinished()] })
    throw new Error(`SDK: Error while loading scene. Main file missing.`)
  }

  const url = resolveMapping(mapping.hash, mappingName, bootstrapData.baseUrl)
  const codeRequest = await fetch(url)

  if (!codeRequest.ok) {
    await EngineApi.sendBatch({ actions: [initMessagesFinished()] })
    throw new Error(
      `SDK: Error while loading ${url} (${mappingName} -> ${mapping?.file}:${mapping?.hash}) the mapping was not found`
    )
  }

  componentSerializeOpt.useBinaryTransform = explorerConfiguration.configurations["enableBinaryTransform"] === "true"

  let didStart = false
  let updateIntervalMs: number = 1000 / 30

  async function sendBatchAndProcessEvents() {
    const actions = batchEvents.events

    if (actions.length) {
      batchEvents.events = []
    }

    const res = await EngineApi.sendBatch({ actions })
    for (const e of res.events) {
      await eventReceiver(EventDataToRuntimeEvent(e))
    }
  }

  async function eventReceiver(event: RuntimeEvent) {
    if (event.type === "raycastResponse") {
      const idAsNumber = parseInt(event.data.queryId, 10)
      if (numberToIdStore[idAsNumber]) {
        event.data.queryId = numberToIdStore[idAsNumber].toString()
      }
    }

    if (!didStart && event.type === "sceneStart") {
      didStart = true
      for (const startFunctionCb of onStartFunctions) {
        try {
          await startFunctionCb()
        } catch (e: any) {
          devToolsAdapter.error(e)
        }
      }
    }

    if (isPointerEvent(event)) {
      eventState.allowOpenExternalUrl = true
    }

    for (const cb of onEventFunctions) {
      try {
        await cb(event)
      } catch (err: any) {
        devToolsAdapter.error(err)
      }
    }
    eventState.allowOpenExternalUrl = false
  }

  let start = performance.now()

  function reschedule() {
    const ms = Math.max((updateIntervalMs - (performance.now() - start)) | 0, 0)
    return sleep(ms)
  }

  async function mainLoop() {
    while (true) {
      const now = performance.now()
      const dtMillis = now - start
      start = now

      const dtSecs = dtMillis / 1000

      for (const trigger of onUpdateFunctions) {
        try {
          await trigger(dtSecs)
        } catch (e: any) {
          devToolsAdapter.error(e)
        }
      }

      try {
        if (!IS_SDK7) await sendBatchAndProcessEvents()
      } catch (error: any) {
        devToolsAdapter.error(error)
      }

      await reschedule()
    }
  }

  const dcl = createDecentralandInterface({
    clientPort,
    onError: (err: Error) => devToolsAdapter.error(err),
    onLog: (...args: any) => devToolsAdapter.log(...args),
    sceneId: bootstrapData.id,
    eventState,
    batchEvents,
    EngineApi,
    onEventFunctions,
    onStartFunctions,
    onUpdateFunctions,
  })

  // create the context for the scene
  const runtimeExecutionContext = prepareSandboxContext({
    dcl: IS_SDK7 ? undefined : dcl,
    canUseFetch,
    canUseWebsocket,
    log: dcl.log,
    previewMode: isPreview.isPreview || unsafeAllowed.status,
  })

  if (bootstrapData.useFPSThrottling === true) {
    setupFpsThrottling(dcl, fullData.scene.parcels.map(parseParcelPosition), (newValue) => {
      updateIntervalMs = newValue
    })
  }

  // TODO: move SDK7 runtime to its own worker
  const sceneModule = IS_SDK7 ? createRuntime(runtimeExecutionContext, clientPort) : undefined

  try {
    const sourceCode = await codeRequest.text()

    // run the code of the scene
    await customEval(sourceCode, runtimeExecutionContext)
  } catch (err) {
    await EngineApi.sendBatch({ actions: [initMessagesFinished()] })

    devToolsAdapter.error(new Error(`SceneRuntime: Error while evaluating the scene ${workerName}`))

    // The devToolsAdapter.error isn't a async function
    //  and the port can be closed because the finishing of the worker
    await sleep(100)

    throw err
  }
  // then notify the kernel that the initial scene was loaded
  batchEvents.events.push(initMessagesFinished())

  if (sceneModule?.exports.onSceneLoaded) {
    onStartFunctions.push(sceneModule.exports.onSceneLoaded)
  }

  if (sceneModule?.exports.onUpdate) {
    onUpdateFunctions.push(sceneModule.exports.onUpdate)
  }

  // wait for didStart=true
  do {
    await sendBatchAndProcessEvents()
  } while (!didStart && (await sleep(100)))

  // finally, start event loop
  await mainLoop()

  // shutdown
}

function isPointerEvent(event: RuntimeEvent): boolean {
  switch (event.type) {
    case "uuidEvent":
      return event.data?.payload?.buttonId !== undefined
  }
  return false
}

async function sleep(ms: number): Promise<boolean> {
  await new Promise<void>((resolve) => setTimeout(resolve, Math.max(ms | 0, 0)))
  return true
}
