"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsControllerServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const communications_controller_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/communications_controller.gen");
var CommunicationsControllerServiceClient;
(function (CommunicationsControllerServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, communications_controller_gen_1.CommunicationsControllerServiceDefinition);
    }
    CommunicationsControllerServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, communications_controller_gen_1.CommunicationsControllerServiceDefinition);
        return {
            ...originalService,
            async send(message) {
                await originalService.send({ message });
            }
        };
    }
    CommunicationsControllerServiceClient.createLegacy = createLegacy;
})(CommunicationsControllerServiceClient = exports.CommunicationsControllerServiceClient || (exports.CommunicationsControllerServiceClient = {}));
