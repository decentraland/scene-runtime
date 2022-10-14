import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { ExperimentalApiServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/experimental_api.gen'

export function createExperimentalAPIServiceClient<Context extends {}>(clientPort: RpcClientPort) {
  return codegen.loadService<Context, ExperimentalApiServiceDefinition>(clientPort, ExperimentalApiServiceDefinition)
}
