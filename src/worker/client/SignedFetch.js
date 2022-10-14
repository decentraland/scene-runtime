"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignedFetchServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const signed_fetch_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/signed_fetch.gen");
var SignedFetchServiceClient;
(function (SignedFetchServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, signed_fetch_gen_1.SignedFetchServiceDefinition);
    }
    SignedFetchServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, signed_fetch_gen_1.SignedFetchServiceDefinition);
        return {
            ...originalService,
            async signedFetch(url, originalInit) {
                let init = undefined;
                if (originalInit) {
                    init = { headers: {} };
                    if (originalInit.headers && typeof originalInit.headers === 'object') {
                        init.headers = originalInit.headers;
                    }
                    if (originalInit.body && typeof originalInit.body === 'string') {
                        init.body = originalInit.body;
                    }
                    if (originalInit.method && typeof originalInit.method === 'string') {
                        init.method = originalInit.method;
                    }
                }
                const responseBodyType = originalInit?.responseBodyType || 'text';
                const result = await originalService.signedFetch({ url, init });
                return {
                    ok: result.ok,
                    status: result.status,
                    statusText: result.statusText,
                    headers: result.headers,
                    json: responseBodyType === 'json' ? JSON.parse(result.body) : undefined,
                    text: responseBodyType === 'text' ? result.body : undefined
                };
            }
        };
    }
    SignedFetchServiceClient.createLegacy = createLegacy;
})(SignedFetchServiceClient = exports.SignedFetchServiceClient || (exports.SignedFetchServiceClient = {}));
