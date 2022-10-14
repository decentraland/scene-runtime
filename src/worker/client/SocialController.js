"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocialControllerServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const social_controller_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/social_controller.gen");
function createSocialControllerServiceClient(clientPort) {
    const originalService = codegen.loadService(clientPort, social_controller_gen_1.SocialControllerServiceDefinition);
    return originalService;
}
exports.createSocialControllerServiceClient = createSocialControllerServiceClient;
