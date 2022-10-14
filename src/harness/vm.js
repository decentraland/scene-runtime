"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIvm = void 0;
const vm2_1 = require("vm2");
const fp_future_1 = require("fp-future");
const undici_1 = require("undici");
const ws_1 = require("ws");
// @ts-ingnore
const shell = require("raw-loader!./artifacts/cli.scene.system.js");
async function runIvm(source, filename, transport) {
    const vm = new vm2_1.default.VM({ eval: true });
    const codeDidRun = (0, fp_future_1.default)();
    vm.setGlobal("runCode", async function (_ignoredSource) {
        try {
            console.log("> server run: " + filename);
            vm.run(source, "file://" + filename);
            codeDidRun.resolve();
        }
        catch (e) {
            console.error("Error running " + filename);
            codeDidRun.reject(e);
        }
    });
    vm.setGlobal("postMessage", function (message) {
        transport.sendMessage(message);
    });
    vm.setGlobal("__env__error", function (error) {
        console.error(error);
    });
    vm.setGlobal("__env__log", function (...args) {
        console.log(...args);
    });
    vm.run(`
    let __messageEventListeners = []
    let __errorEventListeners = []
    let __onUpdateFunctions = []
    global.__env__onTick = function(handler) {
      __onUpdateFunctions.push(handler)
    }
    global.__tick = function(dt) {
      for (let handle of __onUpdateFunctions) {
        handle(dt)
      }
    }
    global.self = global;
    global.onmessage = null;
    global.onerror = null;
    global.__handleMessage = function(event) {
      if (global.onmessage) {
        global.onmessage(event)
      }
      for (let handle of __messageEventListeners) {
        handle(event)
      }
    }
    global.__handleError = function(event) {
      if (global.onerror) {
        global.onerror(event)
      }
      for (let handle of __errorEventListeners) {
        handle(event)
      }
    }
    global.addEventListener = function(event, handler) {
      if (event == 'message'){
        __messageEventListeners.push(handler)
      } else if (event == 'error'){
        __errorEventListeners.push(handler)
      } else {
        throw new Error('Event type "' + event + '" is not supported')
      }
    }
`, "file://env.js");
    vm.setGlobal("setTimeout", (callback, delay, ...args) => {
        return setTimeout(callback(...args), delay);
    });
    vm.setGlobal("fetch", (url, opts) => {
        return (0, undici_1.fetch)(url, opts);
    });
    const location = {
        href: "http://127.0.0.1:8000/",
        ancestorOrigins: {},
        origin: "http://127.0.0.1:8000",
        protocol: "http:",
        host: "127.0.0.1:8000",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/",
        search: "",
        hash: "",
    };
    vm.setGlobal("location", location);
    vm.setGlobal("WebSocket", ws_1.default);
    vm.setGlobal("btoa", (txt) => Buffer.from(txt, "binary").toString("base64"));
    vm.setGlobal("atob", (txt) => Buffer.from(txt, "base64").toString("binary"));
    transport.on("message", (data) => {
        try {
            vm.getGlobal("__handleMessage")({ data });
        }
        catch (e) {
            console.error("onMessage error", e);
        }
    });
    transport.on("error", (e) => {
        console.error("error", e);
        vm.getGlobal("__handleError")({ error: e });
    });
    transport.on("connect", () => {
        console.log("Transport connected");
    });
    vm.run(shell, "shell.js");
    codeDidRun.then(() => {
        let start = Date.now();
        setInterval(() => {
            const x = Date.now();
            const dt = x - start;
            start = x;
            let time = dt / 1000;
            vm.getGlobal("__tick")(time);
        }, 1000 / 30);
    });
    return [codeDidRun];
}
exports.runIvm = runIvm;
