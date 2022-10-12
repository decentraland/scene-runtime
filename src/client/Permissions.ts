import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { PermissionsServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen'

export function createPermissionsServiceClient<Context>(clientPort: RpcClientPort) {
  return codegen.loadService<Context, PermissionsServiceDefinition>(clientPort, PermissionsServiceDefinition)
}
