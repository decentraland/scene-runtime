"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSceneRuntime = void 0;
const client_1 = require("./client");
const Utils_1 = require("./Utils");
const sandbox_1 = require("./sandbox");
const permissions_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen");
const DecentralandInterface_1 = require("./runtime/DecentralandInterface");
const SetupFpsThrottling_1 = require("./runtime/SetupFpsThrottling");
const DevToolsAdapter_1 = require("./runtime/DevToolsAdapter");
const Events_1 = require("./runtime/Events");
/**
 * Converts a string position "-1,5" => { x: -1, y: 5 }
 */
function parseParcelPosition(position) {
    const [x, y] = position
        .trim()
        .split(/\s*,\s*/)
        .map(($) => parseInt($, 10));
    return { x, y };
}
async function startSceneRuntime(client) {
    const workerName = self.name;
    const clientPort = await client.createPort(`scene-${workerName}`);
    const [EngineAPI, EnvironmentAPI, Permissions, DevTools] = await Promise.all([
        client_1.LoadableAPIs.EngineAPI(clientPort),
        client_1.LoadableAPIs.EnvironmentAPI(clientPort),
        client_1.LoadableAPIs.Permissions(clientPort),
        client_1.LoadableAPIs.DevTools(clientPort),
    ]);
    const [canUseWebsocket, canUseFetch] = (await Permissions.hasManyPermissions({
        permissions: [permissions_gen_1.PermissionItem.PI_USE_WEBSOCKET, permissions_gen_1.PermissionItem.PI_USE_FETCH],
    })).hasManyPermission;
    const devToolsAdapter = new DevToolsAdapter_1.DevToolsAdapter(DevTools);
    const eventState = { allowOpenExternalUrl: false };
    const onEventFunctions = [];
    const onUpdateFunctions = [];
    const onStartFunctions = [];
    const batchEvents = {
        events: [],
    };
    const bootstrapData = await EnvironmentAPI.getBootstrapData({});
    const fullData = JSON.parse(bootstrapData.entity?.metadataJson || "{}");
    const isPreview = await EnvironmentAPI.isPreviewMode({});
    const unsafeAllowed = await EnvironmentAPI.areUnsafeRequestAllowed({});
    const explorerConfiguration = await EnvironmentAPI.getExplorerConfiguration({});
    if (!fullData || !fullData.main) {
        throw new Error(`No boostrap data`);
    }
    const mappingName = fullData.main;
    const mapping = bootstrapData.entity?.content.find(($) => $.file === mappingName);
    if (!mapping) {
        await EngineAPI.sendBatch({ actions: [(0, Utils_1.initMessagesFinished)()] });
        throw new Error(`SDK: Error while loading scene. Main file missing.`);
    }
    const url = (0, Utils_1.resolveMapping)(mapping.hash, mappingName, bootstrapData.baseUrl);
    const codeRequest = await fetch(url);
    if (!codeRequest.ok) {
        await EngineAPI.sendBatch({ actions: [(0, Utils_1.initMessagesFinished)()] });
        throw new Error(`SDK: Error while loading ${url} (${mappingName} -> ${mapping?.file}:${mapping?.hash}) the mapping was not found`);
    }
    Utils_1.componentSerializeOpt.useBinaryTransform = explorerConfiguration.configurations["enableBinaryTransform"] === "true";
    let didStart = false;
    let updateIntervalMs = 1000 / 30;
    async function sendBatchAndProcessEvents() {
        const actions = batchEvents.events;
        if (actions.length) {
            batchEvents.events = [];
        }
        const res = await EngineAPI.sendBatch({ actions });
        for (const e of res.events) {
            eventReceiver((0, Events_1.EventDataToRuntimeEvent)(e));
        }
    }
    function eventReceiver(event) {
        if (event.type === "raycastResponse") {
            const idAsNumber = parseInt(event.data.queryId, 10);
            if (Utils_1.numberToIdStore[idAsNumber]) {
                event.data.queryId = Utils_1.numberToIdStore[idAsNumber].toString();
            }
        }
        if (!didStart && event.type === "sceneStart") {
            didStart = true;
            for (const startFunctionCb of onStartFunctions) {
                try {
                    startFunctionCb();
                }
                catch (e) {
                    devToolsAdapter.error(e);
                }
            }
        }
        if (isPointerEvent(event)) {
            eventState.allowOpenExternalUrl = true;
        }
        for (const cb of onEventFunctions) {
            try {
                cb(event);
            }
            catch (err) {
                devToolsAdapter.error(err);
            }
        }
        eventState.allowOpenExternalUrl = false;
    }
    let start = performance.now();
    function reschedule() {
        const ms = Math.max((updateIntervalMs - (performance.now() - start)) | 0, 0);
        setTimeout(mainLoop, ms);
    }
    function mainLoop() {
        const now = performance.now();
        const dtMillis = now - start;
        start = now;
        const dtSecs = dtMillis / 1000;
        for (const trigger of onUpdateFunctions) {
            try {
                trigger(dtSecs);
            }
            catch (e) {
                devToolsAdapter.error(e);
            }
        }
        sendBatchAndProcessEvents().catch(devToolsAdapter.error).finally(reschedule);
    }
    try {
        const sourceCode = await codeRequest.text();
        const dcl = (0, DecentralandInterface_1.createDecentralandInterface)({
            clientPort,
            onError: (err) => devToolsAdapter.error(err),
            onLog: (...args) => devToolsAdapter.log(...args),
            sceneId: bootstrapData.id,
            eventState,
            batchEvents,
            EngineAPI,
            onEventFunctions,
            onStartFunctions,
            onUpdateFunctions,
        });
        // create the context for the scene
        const runtimeExecutionContext = (0, sandbox_1.prepareSandboxContext)({
            dcl,
            canUseFetch,
            canUseWebsocket,
            log: dcl.log,
            previewMode: isPreview.isPreview || unsafeAllowed.status,
        });
        console.dir(bootstrapData);
        if (bootstrapData.useFPSThrottling === true) {
            (0, SetupFpsThrottling_1.setupFpsThrottling)(dcl, fullData.scene.parcels.map(parseParcelPosition), (newValue) => {
                updateIntervalMs = newValue;
            });
        }
        // run the code of the scene
        await (0, sandbox_1.customEval)(sourceCode, runtimeExecutionContext);
    }
    catch (err) {
        await EngineAPI.sendBatch({ actions: [(0, Utils_1.initMessagesFinished)()] });
        devToolsAdapter.error(new Error(`SceneRuntime: Error while evaluating the scene ${workerName}`));
        // The devToolsAdapter.error isn't a async function
        //  and the port can be closed because the finishing of the worker
        await sleep(100);
        throw err;
    }
    // then notify the kernel that the initial scene was loaded
    batchEvents.events.push((0, Utils_1.initMessagesFinished)());
    // wait for didStart=true
    do {
        await sendBatchAndProcessEvents();
    } while (!didStart && (await sleep(100)));
    // finally, start event loop
    mainLoop();
    // shutdown
}
exports.startSceneRuntime = startSceneRuntime;
function isPointerEvent(event) {
    switch (event.type) {
        case "uuidEvent":
            return event.data?.payload?.buttonId !== undefined;
    }
    return false;
}
async function sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, Math.max(ms | 0, 0)));
    return true;
}
