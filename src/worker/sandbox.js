"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareSandboxContext = exports.customEval = void 0;
const Fetch_1 = require("./Fetch");
const WebSocket_1 = require("./WebSocket");
const allowListES5 = [
    'eval',
    'parseInt',
    'parseFloat',
    'isNaN',
    'isFinite',
    'decodeURI',
    'decodeURIComponent',
    'encodeURI',
    'encodeURIComponent',
    'escape',
    'unescape',
    'Object',
    'Function',
    'String',
    'Boolean',
    'Number',
    'Math',
    'Date',
    'RegExp',
    'Error',
    'EvalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError',
    'JSON',
    'Array',
    'Promise',
    'NaN',
    'Infinity'
];
// eslint-disable-next-line @typescript-eslint/ban-types
const defer = Promise.resolve().then.bind(Promise.resolve());
async function customEval(code, context) {
    const sandbox = {};
    const resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000);
    sandbox[resultKey] = {};
    Object.keys(context).forEach(function (key) {
        sandbox[key] = context[key];
    });
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    return defer(() => new Function('code', `with (this) { ${code} }`).call(sandbox, code));
}
exports.customEval = customEval;
function getES5Context(base) {
    // globalThis shouldn't crash here, as allowListES5 is an array of `keyof typeof globalThis`
    allowListES5.forEach(($) => (base[$] = globalThis[$]));
    return base;
}
function prepareSandboxContext(options) {
    const originalFetch = globalThis.fetch;
    const restrictedWebSocket = (0, WebSocket_1.createWebSocket)(options);
    const restrictedFetch = (0, Fetch_1.createFetch)({ ...options, originalFetch });
    globalThis.fetch = restrictedFetch;
    globalThis.WebSocket = restrictedWebSocket;
    const env = { dcl: options.dcl, WebSocket: restrictedWebSocket, fetch: restrictedFetch };
    return getES5Context(env);
}
exports.prepareSandboxContext = prepareSandboxContext;
