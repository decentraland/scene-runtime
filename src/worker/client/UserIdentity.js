"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIdentityServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const user_identity_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/user_identity.gen");
var UserIdentityServiceClient;
(function (UserIdentityServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, user_identity_gen_1.UserIdentityServiceDefinition);
    }
    UserIdentityServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, user_identity_gen_1.UserIdentityServiceDefinition);
        return {
            ...originalService,
            async getUserPublicKey() {
                const realResponse = await originalService.getUserPublicKey({});
                return realResponse.address || null;
            },
            async getUserData() {
                const realResponse = await originalService.getUserData({});
                if (!realResponse.data) {
                    return null;
                }
                return {
                    ...realResponse.data,
                    avatar: {
                        ...realResponse.data.avatar,
                        snapshots: realResponse.data.avatar.snapshots
                    },
                    publicKey: realResponse.data.publicKey || null
                };
            }
        };
    }
    UserIdentityServiceClient.createLegacy = createLegacy;
})(UserIdentityServiceClient = exports.UserIdentityServiceClient || (exports.UserIdentityServiceClient = {}));
