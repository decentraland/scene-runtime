"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDataToRuntimeEvent = void 0;
const engine_api_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen");
function EventDataToRuntimeEvent(e) {
    switch (e.type) {
        case engine_api_gen_1.EventDataType.EDT_GENERIC:
            return { type: e.generic?.eventId || '', data: JSON.parse(e.generic.eventData || '{}') };
        case engine_api_gen_1.EventDataType.EDT_POSITION_CHANGED:
            return { type: 'positionChanged', data: e.positionChanged };
        case engine_api_gen_1.EventDataType.EDT_ROTATION_CHANGED:
            return { type: 'rotationChanged', data: e.rotationChanged };
    }
    return { type: '', data: '{}' };
}
exports.EventDataToRuntimeEvent = EventDataToRuntimeEvent;
