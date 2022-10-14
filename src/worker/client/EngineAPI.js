"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEngineAPIServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const engine_api_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen");
function createEngineAPIServiceClient(clientPort) {
    const originalService = codegen.loadService(clientPort, engine_api_gen_1.EngineApiServiceDefinition);
    return originalService;
}
exports.createEngineAPIServiceClient = createEngineAPIServiceClient;
