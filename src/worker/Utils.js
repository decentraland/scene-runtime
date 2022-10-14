"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMessagesFinished = exports.getIdAsNumber = exports.numberToIdStore = exports.resolveMapping = exports.componentNameRE = exports.generatePBObject = exports.componentSerializeOpt = void 0;
const Vector3_1 = require("@dcl/ecs-math/dist/Vector3");
const Quaternion_1 = require("@dcl/ecs-math/dist/Quaternion");
const engine_api_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen");
const engine_interface_gen_1 = require("@dcl/protocol/out-ts/decentraland/renderer/engine_interface.gen");
const VECTOR3_MEMBER_CAP = 1000000; // Value measured when genesis plaza glitch triggered a physics engine breakdown
const pbTransform = {
    position: Vector3_1.Vector3.Zero(),
    rotation: Quaternion_1.Quaternion.Identity,
    scale: Vector3_1.Vector3.One()
};
const TRANSFORM_CLASS_ID = 1;
const transformData = new ArrayBuffer(40);
const transformView = new DataView(transformData);
exports.componentSerializeOpt = {
    useBinaryTransform: true
};
function generatePBObject(classId, json) {
    if (classId === TRANSFORM_CLASS_ID) {
        const transform = JSON.parse(json);
        if (!exports.componentSerializeOpt.useBinaryTransform)
            return serializeTransform(transform);
        else
            return serializeTransformNoProtobuff(transform);
    }
    return json;
}
exports.generatePBObject = generatePBObject;
function serializeTransform(transform) {
    // Position
    // If we don't cap these vectors, scenes may trigger a physics breakdown when messaging enormous values
    pbTransform.position.set(Math.fround(transform.position.x), Math.fround(transform.position.y), Math.fround(transform.position.z));
    capVector(pbTransform.position, VECTOR3_MEMBER_CAP);
    // Rotation
    pbTransform.rotation.copyFrom(transform.rotation);
    // Scale
    pbTransform.scale.set(Math.fround(transform.scale.x), Math.fround(transform.scale.y), Math.fround(transform.scale.z));
    capVector(pbTransform.scale, VECTOR3_MEMBER_CAP);
    const arrayBuffer = engine_interface_gen_1.PBTransform.encode(pbTransform).finish();
    return btoa(String.fromCharCode(...arrayBuffer));
}
function serializeTransformNoProtobuff(transform) {
    // Position
    // If we don't cap these vectors, scenes may trigger a physics breakdown when messaging enormous values
    const cappedVector = new Vector3_1.Vector3(Math.fround(transform.position.x), Math.fround(transform.position.y), Math.fround(transform.position.z));
    capVector(cappedVector, VECTOR3_MEMBER_CAP);
    let offset = 0;
    transformView.setFloat32(offset, cappedVector.x, true);
    transformView.setFloat32((offset += 4), cappedVector.y, true);
    transformView.setFloat32((offset += 4), cappedVector.z, true);
    // Rotation
    transformView.setFloat32((offset += 4), transform.rotation.x, true);
    transformView.setFloat32((offset += 4), transform.rotation.y, true);
    transformView.setFloat32((offset += 4), transform.rotation.z, true);
    transformView.setFloat32((offset += 4), transform.rotation.w, true);
    // Scale
    cappedVector.set(Math.fround(transform.scale.x), Math.fround(transform.scale.y), Math.fround(transform.scale.z));
    capVector(cappedVector, VECTOR3_MEMBER_CAP);
    transformView.setFloat32((offset += 4), cappedVector.x, true);
    transformView.setFloat32((offset += 4), cappedVector.y, true);
    transformView.setFloat32((offset += 4), cappedVector.z, true);
    const arrayBuffer = new Uint8Array(transformData);
    const base64Value = btoa(String.fromCharCode(...arrayBuffer));
    return base64Value;
}
function capVector(targetVector, cap) {
    if (Math.abs(targetVector.x) > cap) {
        targetVector.x = cap * Math.sign(targetVector.x);
    }
    if (Math.abs(targetVector.y) > cap) {
        targetVector.y = cap * Math.sign(targetVector.y);
    }
    if (Math.abs(targetVector.z) > cap) {
        targetVector.z = cap * Math.sign(targetVector.z);
    }
}
const dataUrlRE = /^data:[^/]+\/[^;]+;base64,/;
const blobRE = /^blob:http/;
exports.componentNameRE = /^(engine\.)/;
function resolveMapping(mapping, mappingName, baseUrl) {
    let url = mappingName;
    if (mapping) {
        url = mapping;
    }
    if (dataUrlRE.test(url)) {
        return url;
    }
    if (blobRE.test(url)) {
        return url;
    }
    return (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/') + url;
}
exports.resolveMapping = resolveMapping;
// NOTE(Brian): The idea is to map all string ids used by this scene to ints
//              so we avoid sending/processing big ids like "xxxxx-xxxxx-xxxxx-xxxxx"
//              that are used by i.e. raycasting queries.
const idToNumberStore = {};
exports.numberToIdStore = {};
let idToNumberStoreCounter = 10; // Starting in 10, to leave room for special cases (such as the root entity)
function addIdToStorage(id, idAsNumber) {
    idToNumberStore[id] = idAsNumber;
    exports.numberToIdStore[idAsNumber] = id;
}
function getIdAsNumber(id) {
    if (!idToNumberStore.hasOwnProperty(id)) {
        idToNumberStoreCounter++;
        addIdToStorage(id, idToNumberStoreCounter);
        return idToNumberStoreCounter;
    }
    else {
        return idToNumberStore[id];
    }
}
exports.getIdAsNumber = getIdAsNumber;
function initMessagesFinished() {
    return {
        type: engine_api_gen_1.EAType.EAT_INIT_MESSAGES_FINISHED,
        tag: 'scene',
        payload: { initMessagesFinished: {} }
    };
}
exports.initMessagesFinished = initMessagesFinished;
