"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelIdentityServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const parcel_identity_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/parcel_identity.gen");
var ParcelIdentityServiceClient;
(function (ParcelIdentityServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, parcel_identity_gen_1.ParcelIdentityServiceDefinition);
    }
    ParcelIdentityServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, parcel_identity_gen_1.ParcelIdentityServiceDefinition);
        return {
            ...originalService,
            /**
             * Returns the coordinates and the definition of a parcel
             */
            async getParcel() {
                const data = await originalService.getParcel({});
                return {
                    land: {
                        sceneId: data.land?.sceneId || '',
                        sceneJsonData: JSON.parse(data.land?.sceneJsonData || '{}'),
                        baseUrl: data.land?.baseUrl || '',
                        baseUrlBundles: data.land?.baseUrlBundles || '',
                        mappingsResponse: {
                            root_cid: data.land?.mappingsResponse?.rootCid || '',
                            parcel_id: data.land?.mappingsResponse?.parcelId || '',
                            contents: data.land?.mappingsResponse?.contents || []
                        }
                    },
                    cid: data.cid
                };
            },
            /**
             * Returns the scene id
             */
            async getSceneId() {
                const data = await originalService.getSceneId({});
                return data.sceneId;
            }
        };
    }
    ParcelIdentityServiceClient.createLegacy = createLegacy;
})(ParcelIdentityServiceClient = exports.ParcelIdentityServiceClient || (exports.ParcelIdentityServiceClient = {}));
