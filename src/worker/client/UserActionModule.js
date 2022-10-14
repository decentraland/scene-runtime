"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserActionModuleServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const user_action_module_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/user_action_module.gen");
var UserActionModuleServiceClient;
(function (UserActionModuleServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, user_action_module_gen_1.UserActionModuleServiceDefinition);
    }
    UserActionModuleServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, user_action_module_gen_1.UserActionModuleServiceDefinition);
        return {
            ...originalService,
            async requestTeleport(destination) {
                await originalService.requestTeleport({ destination });
            }
        };
    }
    UserActionModuleServiceClient.createLegacy = createLegacy;
})(UserActionModuleServiceClient = exports.UserActionModuleServiceClient || (exports.UserActionModuleServiceClient = {}));
