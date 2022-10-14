"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPermissionsServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const permissions_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen");
function createPermissionsServiceClient(clientPort) {
    return codegen.loadService(clientPort, permissions_gen_1.PermissionsServiceDefinition);
}
exports.createPermissionsServiceClient = createPermissionsServiceClient;
