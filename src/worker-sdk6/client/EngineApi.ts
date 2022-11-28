import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { EngineApiServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen'

export function createEngineApiServiceClient<Context extends {}>(clientPort: RpcClientPort) {
  const originalService = codegen.loadService<Context, EngineApiServiceDefinition>(
    clientPort,
    EngineApiServiceDefinition
  )
  return originalService
}
