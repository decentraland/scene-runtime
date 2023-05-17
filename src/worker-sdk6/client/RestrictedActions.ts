import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { RestrictedActionsServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/restricted_actions.gen'

export type PositionType = { x: number; y: number; z: number }

export namespace RestrictedActionsServiceClient {
  export function create<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, RestrictedActionsServiceDefinition>(
      clientPort,
      RestrictedActionsServiceDefinition
    )
  }

  export function createLegacy<Context extends {}>(clientPort: RpcClientPort) {
    const originalService = codegen.loadService<Context, RestrictedActionsServiceDefinition>(
      clientPort,
      RestrictedActionsServiceDefinition
    )

    return {
      ...originalService,
      /**
       * move player to a position inside the scene
       *
       * @param position PositionType
       * @param cameraTarget PositionType
       */
      // async movePlayerTo(newPosition: PositionType, cameraTarget?: PositionType): Promise<void> {
      //   await originalService.movePlayerTo({
      //     newRelativePosition: newPosition,
      //     cameraTarget: cameraTarget || undefined
      //   })
      // },
      /**
       * trigger an emote on the current player
       *
       * @param emote the emote to perform
       */
      async triggerEmote(emote: { predefined: string }): Promise<void> {
        await originalService.triggerEmote({ predefinedEmote: emote.predefined })
      }
    }
  }
}
