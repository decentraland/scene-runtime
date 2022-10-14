"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrictedActionsServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const restricted_actions_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/restricted_actions.gen");
var RestrictedActionsServiceClient;
(function (RestrictedActionsServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, restricted_actions_gen_1.RestrictedActionsServiceDefinition);
    }
    RestrictedActionsServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, restricted_actions_gen_1.RestrictedActionsServiceDefinition);
        return {
            ...originalService,
            /**
             * move player to a position inside the scene
             *
             * @param position PositionType
             * @param cameraTarget PositionType
             */
            async movePlayerTo(newPosition, cameraTarget) {
                await originalService.movePlayerTo({
                    newRelativePosition: newPosition,
                    cameraTarget: cameraTarget || undefined
                });
            },
            /**
             * trigger an emote on the current player
             *
             * @param emote the emote to perform
             */
            async triggerEmote(emote) {
                await originalService.triggerEmote({ predefinedEmote: emote.predefined });
            }
        };
    }
    RestrictedActionsServiceClient.createLegacy = createLegacy;
})(RestrictedActionsServiceClient = exports.RestrictedActionsServiceClient || (exports.RestrictedActionsServiceClient = {}));
