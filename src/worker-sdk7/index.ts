import { createRpcClient } from "@dcl/rpc"
import { WebWorkerTransport } from "@dcl/rpc/dist/transports/WebWorker"

import { LoadableApis } from "./client"
import { resolveMapping } from "../common/Utils"
import { customEval, prepareSandboxContext } from "../common/sandbox"
import { RpcClient } from "@dcl/rpc/dist/types"
import { PermissionItem } from "@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen"

import { DevToolsAdapter } from "./client/DevToolsAdapter"
import type { Scene } from "@dcl/schemas/dist/platform/scene/index"
import { createRuntime } from "./sdk7-runtime"

export async function startSceneRuntime(client: RpcClient) {
  const workerName = self.name
  const clientPort = await client.createPort(`scene-${workerName}`)

  const [EnvironmentApi, Permissions, DevTools] = await Promise.all([
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

  const bootstrapData = await EnvironmentApi.getBootstrapData({})
  const fullData: Scene = JSON.parse(bootstrapData.entity?.metadataJson || "{}")
  const isPreview = await EnvironmentApi.isPreviewMode({})
  const unsafeAllowed = await EnvironmentApi.areUnsafeRequestAllowed({})

  try {
    await run()
  } catch (err) {
    // TODO: await EngineApi.sendBatch({ actions: [initMessagesFinished()] })

    await devToolsAdapter.error(err as any)
    clientPort.close()
    return
  }

  async function getSceneSource() {
    if (!fullData || !fullData.main) {
      throw new Error(`No boostrap data`)
    }

    const mappingName = fullData.main
    const mapping = bootstrapData.entity?.content.find(($) => $.file === mappingName)

    if (!mapping) {
      throw new Error(`SDK: Error while loading scene. Main file missing.`)
    }

    const url = resolveMapping(mapping.hash, mappingName, bootstrapData.baseUrl)
    const codeRequest = await fetch(url)

    if (!codeRequest.ok) {
      throw new Error(
        `SDK: Error while loading ${url} (${mappingName} -> ${mapping?.file}:${mapping?.hash}) the mapping was not found`
      )
    }
    return codeRequest.text()
  }

  async function run() {
    const sourceCode = await getSceneSource()

    let updateIntervalMs: number = 1000 / 30

    // create the context for the scene
    const runtimeExecutionContext = prepareSandboxContext({
      dcl: undefined,
      canUseFetch,
      canUseWebsocket,
      log: (str) => devToolsAdapter.log(str).catch(devToolsAdapter.error),
      previewMode: isPreview.isPreview || unsafeAllowed.status,
    })

    if (bootstrapData.useFPSThrottling === true) {
      // TODO: setup FPS throttling
      // setupFpsThrottling(dcl, fullData.scene.parcels.map(parseParcelPosition), (newValue) => {
      //   updateIntervalMs = newValue
      // })
    }

    const sceneModule = createRuntime(runtimeExecutionContext, clientPort)

    // run the code of the scene
    await customEval(sourceCode, runtimeExecutionContext)

    if (sceneModule.exports.onStart) {
      await sceneModule.exports.onStart()
    }

    // finally, start event loop
    if (sceneModule.exports.onUpdate) {
      // first update always use 0.0 as delta time
      try {
        await sceneModule.exports.onUpdate(0.0)
      } catch (e: any) {
        await devToolsAdapter.error(e)
      }

      let start = performance.now()

      while (true) {
        const now = performance.now()
        const dtMillis = now - start
        start = now

        const dtSecs = dtMillis / 1000

        try {
          await sceneModule.exports.onUpdate(dtSecs)
        } catch (e: any) {
          await devToolsAdapter.error(e)
        }

        // wait for next frame
        const ms = Math.max((updateIntervalMs - (performance.now() - start)) | 0, 0)
        return sleep(ms)
      }
    }
  }

  // shutdown
}

async function sleep(ms: number): Promise<boolean> {
  await new Promise<void>((resolve) => setTimeout(resolve, Math.max(ms | 0, 0)))
  return true
}

createRpcClient(WebWorkerTransport(self))
  .then(startSceneRuntime)
  .catch((err) => console.error(err))
