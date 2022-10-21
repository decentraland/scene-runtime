import { createRpcClient } from '@dcl/rpc'
import { WebWorkerTransport } from '@dcl/rpc/dist/transports/WebWorker'
import { startSceneRuntime } from './SceneRuntime'

createRpcClient(WebWorkerTransport(self))
  .then(startSceneRuntime)
  .catch((err) => console.error(err))