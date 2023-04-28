import { createRpcClient } from '@dcl/rpc'
import { WebWorkerTransport } from '@dcl/rpc/dist/transports/WebWorker'

import { LoadableApis } from './client'
import { RpcClient } from '@dcl/rpc/dist/types'
import { PermissionItem } from '@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen'

import type { Scene } from '@dcl/schemas/dist/platform/scene/index'
import { ConsoleType, createModuleRuntime, createWsFetchRuntime } from './sdk7-runtime'
import { customEvalSdk7 } from './sandbox'

export async function startSceneRuntime(client: RpcClient) {
  const workerName = self.name
  const clientPort = await client.createPort(`scene-${workerName}`)

  const [Permissions, Runtime] = await Promise.all([
    LoadableApis.Permissions(clientPort),
    LoadableApis.Runtime(clientPort)
  ])

  const [canUseWebsocket, canUseFetch] = (
    await Permissions.hasManyPermissions({
      permissions: [PermissionItem.PI_USE_WEBSOCKET, PermissionItem.PI_USE_FETCH]
    })
  ).hasManyPermission

  const bootstrapData = await Runtime.getSceneInformation({})
  const realm = await Runtime.getRealm({})
  const fullData: Scene = JSON.parse(bootstrapData.metadataJson || '{}')
  const isPreview = realm.realmInfo?.isPreview || false

  const loggerName = `[Scene at ${fullData.scene.base}]`

  const runtimeConsole: ConsoleType = {
    log(...args: any[]){
      console.log(loggerName, ...args)
    },
    error(...args: any[]){
      console.error(loggerName, ...args)
    }
  }

  try {
    await run()
  } catch (err) {
    console.error(err as any)
    clientPort.close()
    return
  }

  // this function retrieves the source code of the scene
  async function getSceneSource() {
    if (!fullData || !fullData.main) {
      throw new Error(`No boostrap data`)
    }

    const response = await Runtime.readFile({ fileName: fullData.main })
    const textDecoder = new TextDecoder()
    return textDecoder.decode(response.content)
  }

  async function run() {
    const sourceCode = await getSceneSource()

    let updateIntervalMs: number = 1000 / 30

    // create the context for the scene
    const runtimeExecutionContext = Object.create(null)

    createWsFetchRuntime(
      runtimeExecutionContext,
      { canUseFetch, canUseWebsocket, previewMode: isPreview },
      runtimeConsole
    )

    const sceneModule = createModuleRuntime(runtimeExecutionContext, clientPort, runtimeConsole)

    // run the code of the scene
    await customEvalSdk7(sourceCode, runtimeExecutionContext, isPreview)

    if (!sceneModule.exports.onUpdate && !sceneModule.exports.onStart) {
      // there may be cases where onStart is present and onUpdate not for "static-ish" scenes
      runtimeConsole.error(
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

createRpcClient(WebWorkerTransport(self))
  .then(startSceneRuntime)
  .catch((err) => console.error(err))
