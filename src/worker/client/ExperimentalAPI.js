"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExperimentalAPIServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const experimental_api_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/experimental_api.gen");
function createExperimentalAPIServiceClient(clientPort) {
    return codegen.loadService(clientPort, experimental_api_gen_1.ExperimentalApiServiceDefinition);
}
exports.createExperimentalAPIServiceClient = createExperimentalAPIServiceClient;
