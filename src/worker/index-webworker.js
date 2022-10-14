"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpc_1 = require("@dcl/rpc");
const WebWorker_1 = require("@dcl/rpc/dist/transports/WebWorker");
const SceneRuntime_1 = require("./SceneRuntime");
(0, rpc_1.createRpcClient)((0, WebWorker_1.WebWorkerTransport)(self))
    .then(SceneRuntime_1.startSceneRuntime)
    .catch((err) => console.error(err));
