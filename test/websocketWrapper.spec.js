"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
globalThis.WebSocket = ws_1.default;
const WebSocket_1 = require("../src/worker/WebSocket");
class FakeWebSocket {
    constructor(url, protocols) { }
}
describe("Websocket wrapped for scenes", () => {
    let originalWebSocket = ws_1.default;
    beforeAll(() => {
        originalWebSocket = ws_1.default;
        // @ts-ignore
        globalThis.WebSocket = FakeWebSocket;
    });
    afterAll(() => {
        globalThis.WebSocket = originalWebSocket;
        originalWebSocket = null;
    });
    const log = jest.fn();
    const logPreview = jest.fn();
    const wrappedProductionWebSocket = (0, WebSocket_1.createWebSocket)({
        canUseWebsocket: true,
        log,
        previewMode: false,
    });
    const wrappedPreviewWebSocket = (0, WebSocket_1.createWebSocket)({
        canUseWebsocket: true,
        log: logPreview,
        previewMode: true,
    });
    const wrappedNotAllowedWebSocket = (0, WebSocket_1.createWebSocket)({
        canUseWebsocket: false,
        log,
        previewMode: false,
    });
    it("should run successfully if the ws is secure in deployed scenes", async () => {
        const a = new wrappedProductionWebSocket("wss://decentraland.org");
        a.onopen = () => a.close();
    });
    it("should throw an error if the ws is not secure in deployed scenes", async () => {
        expect(() => {
            new wrappedProductionWebSocket("http://decentraland.org");
        }).toThrow();
    });
    it("should run successfully if the ws is secure in preview scenes", async () => {
        const a = new wrappedPreviewWebSocket("wss://rpc.decentraland.org/mainnet");
        a.onopen = () => a.close();
    });
    it("should log an error if the ws is not secure in preview scenes", async () => {
        jest.resetAllMocks();
        expect(logPreview).not.toHaveBeenCalled();
        new wrappedPreviewWebSocket("ws://rpc.decentraland.org/mainnet");
        expect(logPreview).toHaveBeenCalled();
    });
    it("should throw an error because it does not have permissions", async () => {
        expect(() => {
            new wrappedNotAllowedWebSocket("wss://rpc.decentraland.org/mainnet");
        }).toThrow();
    });
});
