"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentAPIServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const environment_api_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/environment_api.gen");
var EnvironmentAPIServiceClient;
(function (EnvironmentAPIServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, environment_api_gen_1.EnvironmentApiServiceDefinition);
    }
    EnvironmentAPIServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, environment_api_gen_1.EnvironmentApiServiceDefinition);
        return {
            ...originalService,
            async getBootstrapData() {
                const res = await originalService.getBootstrapData({});
                const sceneMetadata = JSON.parse(res.entity?.metadataJson || '{}');
                return {
                    sceneId: res.id,
                    name: sceneMetadata.display?.title || 'Unnamed',
                    main: sceneMetadata.main,
                    baseUrl: res.baseUrl,
                    mappings: res.entity?.content || [],
                    useFPSThrottling: res.useFPSThrottling,
                    data: sceneMetadata
                };
            },
            /**
             * Returns if the feature flag unsafe-request is on
             */
            async areUnsafeRequestAllowed() {
                return (await originalService.areUnsafeRequestAllowed({})).status;
            },
            /**
             * Returns the current connected realm
             */
            async getCurrentRealm() {
                const res = await originalService.getCurrentRealm({});
                return res.currentRealm;
            },
            /**
             * Returns whether the scene is running in preview mode or not
             */
            async isPreviewMode() {
                const res = await originalService.isPreviewMode({});
                return res.isPreview;
            },
            /**
             * Returns explorer configuration and environment information
             */
            async getExplorerConfiguration() {
                return await originalService.getExplorerConfiguration({});
            },
            /**
             * Returns what platform is running the scene
             */
            async getPlatform() {
                return (await originalService.getPlatform({})).platform;
            },
            /**
             * Returns Decentraland's time
             */
            async getDecentralandTime() {
                return await originalService.getDecentralandTime({});
            }
        };
    }
    EnvironmentAPIServiceClient.createLegacy = createLegacy;
})(EnvironmentAPIServiceClient = exports.EnvironmentAPIServiceClient || (exports.EnvironmentAPIServiceClient = {}));
