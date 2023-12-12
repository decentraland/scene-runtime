import { createRpcClient } from '@dcl/rpc'

import { LoadableApis } from './client'
import { resolveMapping } from '../common/Utils'
import { RpcClient } from '@dcl/rpc/dist/types'
import { PermissionItem } from '@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen'

import { DevToolsAdapter } from './client/DevToolsAdapter'
import type { Scene } from '@dcl/schemas/dist/platform/scene/index'
import { createModuleRuntime, createWsFetchRuntime } from './sdk7-runtime'
import { customEvalSdk7 } from './sandbox'
import { WebWorkerTransportV2 } from '../common/RpcTransportWebWorkerV2'

export async function startSceneRuntime(client: RpcClient) {
  const workerName = self.name
  const clientPort = await client.createPort(`scene-${workerName}`)

  const [EnvironmentApi, Permissions, DevTools] = await Promise.all([
    LoadableApis.EnvironmentApi(clientPort),
    LoadableApis.Permissions(clientPort),
    LoadableApis.DevTools(clientPort)
  ])

  const [canUseWebsocket, canUseFetch] = (
    await Permissions.hasManyPermissions({
      permissions: [PermissionItem.PI_USE_WEBSOCKET, PermissionItem.PI_USE_FETCH]
    })
  ).hasManyPermission

  const devToolsAdapter = new DevToolsAdapter(DevTools)

  const bootstrapData = await EnvironmentApi.getBootstrapData({})
  const fullData: Scene = JSON.parse(bootstrapData.entity?.metadataJson || '{}')
  const isPreview = await EnvironmentApi.isPreviewMode({})
  const unsafeAllowed = await EnvironmentApi.areUnsafeRequestAllowed({})

  try {
    await run()
  } catch (err) {
    // TODO: await EngineApi.sendBatch({ actions: [initMessagesFinished()] })
    if (isPreview.isPreview) {
      clientPort.close()
      throw err
    } else {
      await devToolsAdapter.error(err as Error)
      clientPort.close()
    }
  }

  async function getSceneSource() {
    if (!fullData || !fullData.main) {
      throw new Error(`No boostrap data`)
    }

    // Inject SDK7 Adaption Layer
    const isSdk7 = (fullData as any).runtimeVersion === '7'
    if (!isSdk7) {
      const request = await fetch(`https://renderer-artifacts.decentraland.org/sdk7-adaption-layer/main/index.js`)
      return request.text()
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

    if (bootstrapData.useFPSThrottling === true) {
      // TODO: setup FPS throttling
      // setupFpsThrottling(dcl, fullData.scene.parcels.map(parseParcelPosition), (newValue) => {
      //   updateIntervalMs = newValue
      // })
    }

    // create the context for the scene
    const runtimeExecutionContext = Object.create(null)

    createWsFetchRuntime(
      runtimeExecutionContext,
      { canUseFetch, canUseWebsocket, previewMode: isPreview.isPreview || unsafeAllowed.status },
      devToolsAdapter
    )

    const sceneModule = createModuleRuntime(runtimeExecutionContext, clientPort, devToolsAdapter)

    // run the code of the scene
    await customEvalSdk7(sourceCode, runtimeExecutionContext)

    if (!sceneModule.exports.onUpdate && !sceneModule.exports.onStart) {
      // there may be cases where onStart is present and onUpdate not for "static-ish" scenes
      await devToolsAdapter.error(
        new Error(
          '🚨🚨🚨🚨🚨 Your scene does not export an onUpdate function. Documentation: https://dcl.gg/sdk/missing-onUpdate'
        )
      )
    }

    await sceneModule.runStart()

    // finally, start event loop
    if (sceneModule.exports.onUpdate) {
      // first update always use 0.0 as delta time
      await sceneModule.runUpdate(0.0)

      let start = performance.now()

      while (true) {
        const now = performance.now()
        const dtMillis = now - start
        start = now

        const dtSecs = dtMillis / 1000

        await sceneModule.runUpdate(dtSecs)

        // wait for next frame
        const ms = Math.max((updateIntervalMs - (performance.now() - start)) | 0, 0)
        await sleep(ms)
      }
    }
  }

  // shutdown
}

async function sleep(ms: number): Promise<boolean> {
  await new Promise<void>((resolve) => setTimeout(resolve, Math.max(ms | 0, 0)))
  return true
}

createRpcClient(WebWorkerTransportV2(self)).then(startSceneRuntime)
