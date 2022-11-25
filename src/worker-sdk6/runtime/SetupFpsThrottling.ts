export function setupFpsThrottling(
  dcl: DecentralandInterface,
  parcels: Array<{ x: number; y: number }>,
  onChangeUpdateInterval: (newValue: number) => void
) {
  dcl.subscribe('positionChanged')
  dcl.onEvent((event) => {
    if (event.type !== 'positionChanged') {
      return
    }

    const e = event.data as IEvents['positionChanged']

    //NOTE: calling worldToGrid from parcelScenePositions.ts here crashes kernel when there are 80+ workers since chrome 92.
    const PARCEL_SIZE = 16
    const playerPosition = {
      x: Math.floor(e.cameraPosition.x / PARCEL_SIZE),
      y: Math.floor(e.cameraPosition.z / PARCEL_SIZE)
    }

    if (playerPosition === undefined) {
      return
    }

    const playerPos = playerPosition

    let sqrDistanceToPlayerInParcels = 10 * 10
    let isInsideScene = false

    for (const parcel of parcels) {
      sqrDistanceToPlayerInParcels = Math.min(sqrDistanceToPlayerInParcels, distanceSquared(playerPos, parcel))
      if (parcel.x === playerPos.x && parcel.y === playerPos.y) {
        isInsideScene = true
      }
    }

    let fps: number = 1

    if (isInsideScene) {
      fps = 30
    } else if (sqrDistanceToPlayerInParcels <= 2 * 2) {
      // NOTE(Brian): Yes, this could be a formula, but I prefer this pedestrian way as
      //              its easier to read and tweak (i.e. if we find out its better as some arbitrary curve, etc).
      fps = 20
    } else if (sqrDistanceToPlayerInParcels <= 3 * 3) {
      fps = 10
    } else if (sqrDistanceToPlayerInParcels <= 4 * 4) {
      fps = 5
    }

    onChangeUpdateInterval(1000 / fps)
  })
}

function distanceSquared(a: Record<'x' | 'y', number>, b: Record<'x' | 'y', number>) {
  const x = a.x - b.x
  const y = a.y - b.y

  return x * x + y * y
}
