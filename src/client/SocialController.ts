import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { SocialControllerServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/social_controller.gen'

export function createSocialControllerServiceClient<Context>(clientPort: RpcClientPort) {
  const originalService = codegen.loadService<Context, SocialControllerServiceDefinition>(
    clientPort,
    SocialControllerServiceDefinition
  )

  return originalService
}
