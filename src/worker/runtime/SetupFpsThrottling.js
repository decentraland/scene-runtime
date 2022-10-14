"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFpsThrottling = void 0;
const Vector2_1 = require("@dcl/ecs-math/dist/Vector2");
function setupFpsThrottling(dcl, parcels, onChangeUpdateInterval) {
    dcl.subscribe('positionChanged');
    dcl.onEvent((event) => {
        if (event.type !== 'positionChanged') {
            return;
        }
        const e = event.data;
        //NOTE: calling worldToGrid from parcelScenePositions.ts here crashes kernel when there are 80+ workers since chrome 92.
        const PARCEL_SIZE = 16;
        const playerPosition = new Vector2_1.Vector2(Math.floor(e.cameraPosition.x / PARCEL_SIZE), Math.floor(e.cameraPosition.z / PARCEL_SIZE));
        if (playerPosition === undefined) {
            return;
        }
        const playerPos = playerPosition;
        let sqrDistanceToPlayerInParcels = 10 * 10;
        let isInsideScene = false;
        for (const parcel of parcels) {
            sqrDistanceToPlayerInParcels = Math.min(sqrDistanceToPlayerInParcels, Vector2_1.Vector2.DistanceSquared(playerPos, parcel));
            if (parcel.x === playerPos.x && parcel.y === playerPos.y) {
                isInsideScene = true;
            }
        }
        let fps = 1;
        if (isInsideScene) {
            fps = 30;
        }
        else if (sqrDistanceToPlayerInParcels <= 2 * 2) {
            // NOTE(Brian): Yes, this could be a formula, but I prefer this pedestrian way as
            //              its easier to read and tweak (i.e. if we find out its better as some arbitrary curve, etc).
            fps = 20;
        }
        else if (sqrDistanceToPlayerInParcels <= 3 * 3) {
            fps = 10;
        }
        else if (sqrDistanceToPlayerInParcels <= 4 * 4) {
            fps = 5;
        }
        onChangeUpdateInterval(1000 / fps);
    });
}
exports.setupFpsThrottling = setupFpsThrottling;
