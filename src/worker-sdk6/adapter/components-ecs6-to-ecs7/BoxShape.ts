import { ecs7EnsureEntity } from '../ecs7/ECS7'
import { ECS6State } from '../types'

import { MeshRenderer, MeshCollider } from '@dcl/ecs'

export function update(state: ECS6State, ecs6EntityId: EntityID, payload: any) {
  const ecs7Entity = ecs7EnsureEntity(state, ecs6EntityId)

  if (payload.visible) {
    const uvs: number[] = payload.uvs || []

    MeshRenderer.createOrReplace(ecs7Entity, { box: { uvs } } as any)
  } else if (MeshRenderer.getOrNull(ecs7Entity)) {
    MeshRenderer.deleteFrom(ecs7Entity)
  }

  if (payload.isPointerBlocker || payload.withCollisions) {
    let mask = 0
    if (payload.isPointerBlocker) mask |= 1
    if (payload.withCollisions) mask |= 2

    MeshCollider.createOrReplace(ecs7Entity, { box: {}, collisionMask: mask } as any)
  } else if (MeshCollider.getOrNull(ecs7Entity)) {
    MeshCollider.deleteFrom(ecs7Entity)
  }
}

export function remove(state: ECS6State, ecs6EntityId: EntityID) {
  const ecs7Entity = ecs7EnsureEntity(state, ecs6EntityId)
  if (MeshRenderer.getOrNull(ecs7Entity)) {
    MeshRenderer.deleteFrom(ecs7Entity)
  }
  if (MeshCollider.getOrNull(ecs7Entity)) {
    MeshCollider.deleteFrom(ecs7Entity)
  }
}
