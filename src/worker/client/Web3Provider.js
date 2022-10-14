"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLegacyWeb3Provider = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const ethereum_controller_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/ethereum_controller.gen");
function createLegacyWeb3Provider(clientPort) {
    const originalService = codegen.loadService(clientPort, ethereum_controller_gen_1.EthereumControllerServiceDefinition);
    async function request(message) {
        const response = await originalService.sendAsync({
            id: message.id,
            method: message.method,
            jsonParams: JSON.stringify(message.params)
        });
        return JSON.parse(response.jsonAnyResponse);
    }
    return {
        async getProvider() {
            return {
                // @internal
                send(message, callback) {
                    if (message && callback && callback instanceof Function) {
                        request(message)
                            .then((x) => callback(null, x))
                            .catch(callback);
                    }
                    else {
                        throw new Error('Decentraland provider only allows async calls');
                    }
                },
                sendAsync(message, callback) {
                    request(message)
                        .then((x) => callback(null, x))
                        .catch(callback);
                }
            };
        }
    };
}
exports.createLegacyWeb3Provider = createLegacyWeb3Provider;
