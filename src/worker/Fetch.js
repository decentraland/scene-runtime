"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFetch = void 0;
const p_queue_1 = require("p-queue");
const TIMEOUT_LIMIT = 29000;
function createFetch({ canUseFetch, previewMode, log, originalFetch }) {
    const fifoFetch = new p_queue_1.default({ concurrency: 1 });
    return async (resource, init) => {
        const url = resource instanceof Request ? resource.url : resource;
        if (url.toLowerCase().substr(0, 8) !== "https://") {
            if (previewMode) {
                log("⚠️ Warning: Can't make an unsafe http request in deployed scenes, please consider upgrading to https. url=" +
                    url);
            }
            else {
                return Promise.reject(new Error("Can't make an unsafe http request, please upgrade to https. url=" + url));
            }
        }
        if (!canUseFetch) {
            return Promise.reject(new Error("This scene is not allowed to use fetch."));
        }
        async function fetchRequest() {
            const abortController = new AbortController();
            const timeout = setTimeout(() => {
                ;
                abortController.abort();
            }, Math.max(init?.timeout || TIMEOUT_LIMIT, 1));
            try {
                // DO NOT remove the "await" from the next line
                return await originalFetch(resource, { signal: abortController.signal, ...init });
            }
            finally {
                clearTimeout(timeout);
            }
        }
        return fifoFetch.add(fetchRequest);
    };
}
exports.createFetch = createFetch;
