"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const players_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/players.gen");
var PlayersServiceClient;
(function (PlayersServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, players_gen_1.PlayersServiceDefinition);
    }
    PlayersServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, players_gen_1.PlayersServiceDefinition);
        return {
            ...originalService,
            /**
             * Return the players's data
             */
            async getPlayerData(opt) {
                const originalResponse = await originalService.getPlayerData({ userId: opt.userId });
                if (!originalResponse.data) {
                    return null;
                }
                return {
                    ...originalResponse.data,
                    avatar: {
                        ...originalResponse.data.avatar,
                        snapshots: originalResponse.data.avatar.snapshots
                    },
                    publicKey: originalResponse.data.publicKey || null
                };
            },
            /**
             * Return array of connected players
             */
            async getConnectedPlayers() {
                return (await originalService.getConnectedPlayers({})).players;
            },
            /**
             * Return array of players inside the scene
             */
            async getPlayersInScene() {
                return (await originalService.getPlayersInScene({})).players;
            }
        };
    }
    PlayersServiceClient.createLegacy = createLegacy;
})(PlayersServiceClient = exports.PlayersServiceClient || (exports.PlayersServiceClient = {}));
