"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDecentralandInterface = void 0;
const client_1 = require("../client");
const Utils_1 = require("../Utils");
const engine_api_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen");
function createDecentralandInterface(options) {
    const { batchEvents, onError, onLog, sceneId, onEventFunctions, clientPort, eventState } = options;
    const sceneLoadedModules = {};
    const dcl = {
        DEBUG: true,
        log(...args) {
            onLog(...args);
        },
        openExternalUrl(url) {
            try {
                const u = new URL(url);
                if (u.protocol !== 'https:')
                    throw new Error('Only https: external links are allowed');
            }
            catch (err) {
                onError(err);
                return;
            }
            if (JSON.stringify(url).length > 49000) {
                onError(new Error('URL payload cannot exceed 49.000 bytes'));
                return;
            }
            if (eventState.allowOpenExternalUrl) {
                batchEvents.events.push({
                    type: engine_api_gen_1.EAType.EAT_OPEN_EXTERNAL_URL,
                    tag: '',
                    payload: { openExternalUrl: { url } }
                });
            }
            else {
                this.error('openExternalUrl can only be used inside a pointerEvent');
            }
        },
        openNFTDialog(assetContractAddress, tokenId, comment) {
            if (eventState.allowOpenExternalUrl) {
                const payloadLength = assetContractAddress.length + tokenId.length + (comment?.length || 0);
                if (payloadLength > 49000) {
                    onError(new Error('OpenNFT payload cannot exceed 49.000 bytes'));
                    return;
                }
                batchEvents.events.push({
                    type: engine_api_gen_1.EAType.EAT_OPEN_NFT_DIALOG,
                    tag: '',
                    payload: { openNftDialog: { assetContractAddress, tokenId, comment: comment || '' } }
                });
            }
            else {
                this.error('openNFTDialog can only be used inside a pointerEvent');
            }
        },
        addEntity(entityId) {
            if (entityId === '0') {
                // We dont create the entity 0 in the engine.
                return;
            }
            batchEvents.events.push({
                type: engine_api_gen_1.EAType.EAT_CREATE_ENTITY,
                payload: { createEntity: { id: entityId } }
            });
        },
        removeEntity(entityId) {
            batchEvents.events.push({
                type: engine_api_gen_1.EAType.EAT_REMOVE_ENTITY,
                payload: { removeEntity: { id: entityId } }
            });
        },
        /** update tick */
        onUpdate(cb) {
            if (typeof cb !== 'function') {
                onError(new Error('onUpdate must be called with only a function argument'));
            }
            else {
                options.onUpdateFunctions.push(cb);
            }
        },
        /** event from the engine */
        onEvent(cb) {
            if (typeof cb !== 'function') {
                onError(new Error('onEvent must be called with only a function argument'));
            }
            else {
                onEventFunctions.push(cb);
            }
        },
        /** called after adding a component to the entity or after updating a component */
        updateEntityComponent(entityId, componentName, classId, json) {
            if (json.length > 49000) {
                onError(new Error('Component payload cannot exceed 49.000 bytes'));
                return;
            }
            if (Utils_1.componentNameRE.test(componentName)) {
                batchEvents.events.push({
                    type: engine_api_gen_1.EAType.EAT_UPDATE_ENTITY_COMPONENT,
                    tag: sceneId + '_' + entityId + '_' + classId,
                    payload: {
                        updateEntityComponent: {
                            entityId,
                            classId,
                            name: componentName.replace(Utils_1.componentNameRE, ''),
                            json: (0, Utils_1.generatePBObject)(classId, json)
                        }
                    }
                });
            }
        },
        /** called after adding a DisposableComponent to the entity */
        attachEntityComponent(entityId, componentName, id) {
            if (Utils_1.componentNameRE.test(componentName)) {
                batchEvents.events.push({
                    type: engine_api_gen_1.EAType.EAT_ATTACH_ENTITY_COMPONENT,
                    tag: entityId,
                    payload: {
                        attachEntityComponent: {
                            entityId,
                            name: componentName.replace(Utils_1.componentNameRE, ''),
                            id
                        }
                    }
                });
            }
        },
        /** call after removing a component from the entity */
        removeEntityComponent(entityId, componentName) {
            if (Utils_1.componentNameRE.test(componentName)) {
                batchEvents.events.push({
                    type: engine_api_gen_1.EAType.EAT_COMPONENT_REMOVED,
                    tag: entityId,
                    payload: {
                        componentRemoved: {
                            entityId,
                            name: componentName.replace(Utils_1.componentNameRE, '')
                        }
                    }
                });
            }
        },
        /** set a new parent for the entity */
        setParent(entityId, parentId) {
            batchEvents.events.push({
                type: engine_api_gen_1.EAType.EAT_SET_ENTITY_PARENT,
                tag: entityId,
                payload: {
                    setEntityParent: {
                        entityId,
                        parentId
                    }
                }
            });
        },
        /** queries for a specific system with a certain query configuration */
        query(queryType, payload) {
            payload.queryId = (0, Utils_1.getIdAsNumber)(payload.queryId).toString();
            batchEvents.events.push({
                type: engine_api_gen_1.EAType.EAT_QUERY,
                tag: sceneId + '_' + payload.queryId,
                payload: {
                    query: {
                        queryId: (0, engine_api_gen_1.queryTypeFromJSON)(queryType),
                        payload: JSON.stringify(payload)
                    }
                }
            });
        },
        /** subscribe to specific events, events will be handled by the onEvent function */
        subscribe(eventName) {
            options.EngineAPI.subscribe({ eventId: eventName }).catch((err) => onError(err));
        },
        /** unsubscribe to specific event */
        unsubscribe(eventName) {
            options.EngineAPI.unsubscribe({ eventId: eventName }).catch((err) => onError(err));
        },
        componentCreated(id, componentName, classId) {
            if (Utils_1.componentNameRE.test(componentName)) {
                batchEvents.events.push({
                    type: engine_api_gen_1.EAType.EAT_COMPONENT_CREATED,
                    tag: id,
                    payload: {
                        componentCreated: {
                            id,
                            classId,
                            name: componentName.replace(Utils_1.componentNameRE, '')
                        }
                    }
                });
            }
        },
        componentDisposed(id) {
            batchEvents.events.push({
                type: engine_api_gen_1.EAType.EAT_COMPONENT_DISPOSED,
                tag: id,
                payload: {
                    componentDisposed: { id }
                }
            });
        },
        componentUpdated(id, json) {
            batchEvents.events.push({
                type: engine_api_gen_1.EAType.EAT_COMPONENT_UPDATED,
                tag: id,
                payload: {
                    componentUpdated: {
                        id,
                        json
                    }
                }
            });
        },
        loadModule: async (_moduleName) => {
            if (!(_moduleName in sceneLoadedModules)) {
                const loadedModule = loadSceneModule(clientPort, _moduleName);
                sceneLoadedModules[_moduleName] = {
                    rpcHandle: _moduleName,
                    __INTERNAL_UNSAFE_loadedModule: loadedModule,
                    methods: Object.keys(loadedModule).map((name) => ({ name }))
                };
            }
            return sceneLoadedModules[_moduleName];
        },
        callRpc: async (rpcHandle, methodName, args) => {
            const module = sceneLoadedModules[rpcHandle];
            if (!module) {
                throw new Error(`RPCHandle: ${rpcHandle} is not loaded`);
            }
            // eslint-disable-next-line prefer-spread
            return module.__INTERNAL_UNSAFE_loadedModule[methodName].apply(module, args);
        },
        onStart(cb) {
            options.onStartFunctions.push(cb);
        },
        error(message, data) {
            onError(Object.assign(new Error(message), { data }));
        }
    };
    return dcl;
}
exports.createDecentralandInterface = createDecentralandInterface;
function loadSceneModule(clientPort, moduleName) {
    // - moduleNames that start with @decentraland are from ECS6 and they should load the legacy ones.
    // - moduleNames that start with ~system, are the new ones that follow the protocol buffer generation
    //    (a single object as @param, and a single object as @returns)
    const moduleToLoad = moduleName.replace(/^@decentraland\//, 'Legacy').replace(/^~system\//, '');
    try {
        if (moduleToLoad in client_1.LoadableAPIs) {
            return client_1.LoadableAPIs[moduleToLoad](clientPort);
        }
        else {
            throw new Error('The module is not available in the list!');
        }
    }
    catch (e) {
        throw Object.assign(new Error(`Error getting the methods of ${moduleToLoad}: ` + e.message), {
            original: e
        });
    }
}
