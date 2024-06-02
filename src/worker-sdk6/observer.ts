import { EntityAction } from "@dcl/protocol/out-ts/decentraland/sdk/ecs6/engine_interface_ecs6.gen";

;(globalThis as any).bunchOfActions = []

export function parseActions(actions: EntityAction[]) {
    ;(globalThis as any).bunchOfActions.push(...actions)
}