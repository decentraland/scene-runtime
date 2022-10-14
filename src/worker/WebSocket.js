"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebSocket = void 0;
function createWebSocket({ canUseWebsocket, previewMode, log }) {
    return class RestrictedWebSocket extends WebSocket {
        constructor(url, protocols) {
            if (url.toString().toLowerCase().substr(0, 4) !== 'wss:') {
                if (previewMode) {
                    log("⚠️ Warning: can't connect to unsafe WebSocket (ws) server in deployed scenes, consider upgrading to wss.");
                }
                else {
                    throw new Error("Can't connect to unsafe WebSocket server");
                }
            }
            if (!canUseWebsocket) {
                throw new Error("This scene doesn't have allowed to use WebSocket");
            }
            super(url.toString(), protocols);
        }
    };
}
exports.createWebSocket = createWebSocket;
