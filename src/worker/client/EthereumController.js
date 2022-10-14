"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumControllerServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const ethereum_controller_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/ethereum_controller.gen");
var EthereumControllerServiceClient;
(function (EthereumControllerServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, ethereum_controller_gen_1.EthereumControllerServiceDefinition);
    }
    EthereumControllerServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, ethereum_controller_gen_1.EthereumControllerServiceDefinition);
        return {
            ...originalService,
            /**
             * Requires a generic payment in ETH or ERC20.
             * @param  {string} [toAddress] - NFT asset id.
             * @param  {number} [amount] - Exact amount of the order.
             * @param  {string} [currency] - ETH or ERC20 supported token symbol
             */
            async requirePayment(toAddress, amount, currency) {
                const response = await originalService.requirePayment({ toAddress, amount, currency });
                return JSON.parse(response.jsonAnyResponse);
            },
            /**
             * Takes a dictionary, converts it to string with correct format and signs it.
             * @param  {messageToSign} [MessageDict] - Message in an object format.
             * @return {object} - Promise of message and signature in an object.
             */
            async signMessage(message) {
                return await originalService.signMessage({ message });
            },
            /**
             * Takes a message string, parses it and converts to object.
             * @param  {message} [string] - Message in a string format.
             * @return {object} - Promise of message as a MessageDict.
             * @internal
             */
            async convertMessageToObject(message) {
                return (await originalService.convertMessageToObject({ message })).dict;
            },
            /**
             * Used to build a Ethereum provider
             */
            async sendAsync(message) {
                return JSON.parse((await originalService.sendAsync({
                    id: message.id,
                    method: message.method,
                    jsonParams: JSON.stringify(message.params)
                })).jsonAnyResponse);
            },
            /**
             * Returns the user's public key (address)
             */
            async getUserAccount() {
                return (await originalService.getUserAccount({})).address;
            }
        };
    }
    EthereumControllerServiceClient.createLegacy = createLegacy;
})(EthereumControllerServiceClient = exports.EthereumControllerServiceClient || (exports.EthereumControllerServiceClient = {}));
