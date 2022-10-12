import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { DevToolsServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/dev_tools.gen'

export function createDevToolsServiceClient<Context>(clientPort: RpcClientPort) {
  const originalService = codegen.loadService<Context, DevToolsServiceDefinition>(clientPort, DevToolsServiceDefinition)

  return originalService
}
