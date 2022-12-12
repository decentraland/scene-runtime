import { EAType } from "@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen"

type Vector3 = Record<"x" | "y" | "z", number>
type Quaternion = Record<"x" | "y" | "z" | "w", number>

type Transform = {
  position: Vector3
  rotation: Quaternion
  scale: Vector3
}

const VECTOR3_MEMBER_CAP = 1000000 // Value measured when genesis plaza glitch triggered a physics engine breakdown

const TRANSFORM_CLASS_ID = 1

const transformData: ArrayBuffer = new ArrayBuffer(40)
const transformView: DataView = new DataView(transformData)

export function generatePBObject(classId: number, json: string): string {
  if (classId === TRANSFORM_CLASS_ID) {
    const transform: Transform = JSON.parse(json)
    return serializeTransform(transform)
  }

  return json
}


function serializeTransform(transform: Transform): string {
  // Position
  // If we don't cap these vectors, scenes may trigger a physics breakdown when messaging enormous values
  const cappedVector = {
    x: Math.fround(transform.position.x),
    y: Math.fround(transform.position.y),
    z: Math.fround(transform.position.z),
  }
  capVector(cappedVector, VECTOR3_MEMBER_CAP)

  let offset: number = 0
  transformView.setFloat32(offset, cappedVector.x, true)
  transformView.setFloat32((offset += 4), cappedVector.y, true)
  transformView.setFloat32((offset += 4), cappedVector.z, true)

  // Rotation
  transformView.setFloat32((offset += 4), transform.rotation.x, true)
  transformView.setFloat32((offset += 4), transform.rotation.y, true)
  transformView.setFloat32((offset += 4), transform.rotation.z, true)
  transformView.setFloat32((offset += 4), transform.rotation.w, true)

  // Scale
  cappedVector.x = Math.fround(transform.scale.x)
  cappedVector.y = Math.fround(transform.scale.y)
  cappedVector.z = Math.fround(transform.scale.z)

  capVector(cappedVector, VECTOR3_MEMBER_CAP)
  transformView.setFloat32((offset += 4), cappedVector.x, true)
  transformView.setFloat32((offset += 4), cappedVector.y, true)
  transformView.setFloat32((offset += 4), cappedVector.z, true)

  const arrayBuffer: Uint8Array = new Uint8Array(transformData)
  const base64Value = btoa(String.fromCharCode(...arrayBuffer))
  return base64Value
}

function capVector(targetVector: Vector3, cap: number) {
  if (Math.abs(targetVector.x) > cap) {
    targetVector.x = cap * Math.sign(targetVector.x)
  }

  if (Math.abs(targetVector.y) > cap) {
    targetVector.y = cap * Math.sign(targetVector.y)
  }

  if (Math.abs(targetVector.z) > cap) {
    targetVector.z = cap * Math.sign(targetVector.z)
  }
}

const dataUrlRE = /^data:[^/]+\/[^;]+;base64,/
const blobRE = /^blob:http/

export const componentNameRE = /^(engine\.)/

export function resolveMapping(mapping: string | undefined, mappingName: string, baseUrl: string) {
  let url = mappingName

  if (mapping) {
    url = mapping
  }

  if (dataUrlRE.test(url)) {
    return url
  }

  if (blobRE.test(url)) {
    return url
  }

  return (baseUrl.endsWith("/") ? baseUrl : baseUrl + "/") + url
}

// NOTE(Brian): The idea is to map all string ids used by this scene to ints
//              so we avoid sending/processing big ids like "xxxxx-xxxxx-xxxxx-xxxxx"
//              that are used by i.e. raycasting queries.
const idToNumberStore: Record<string, number> = {}
export const numberToIdStore: Record<number, string> = {}
let idToNumberStoreCounter: number = 10 // Starting in 10, to leave room for special cases (such as the root entity)

function addIdToStorage(id: string, idAsNumber: number) {
  idToNumberStore[id] = idAsNumber
  numberToIdStore[idAsNumber] = id
}

export function getIdAsNumber(id: string): number {
  if (!idToNumberStore.hasOwnProperty(id)) {
    idToNumberStoreCounter++
    addIdToStorage(id, idToNumberStoreCounter)
    return idToNumberStoreCounter
  } else {
    return idToNumberStore[id]
  }
}

export function initMessagesFinished() {
  return {
    type: EAType.EAT_INIT_MESSAGES_FINISHED,
    tag: "scene",
    payload: { initMessagesFinished: {} },
  }
}
