"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevToolsServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const dev_tools_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/dev_tools.gen");
function createDevToolsServiceClient(clientPort) {
    const originalService = codegen.loadService(clientPort, dev_tools_gen_1.DevToolsServiceDefinition);
    return originalService;
}
exports.createDevToolsServiceClient = createDevToolsServiceClient;
