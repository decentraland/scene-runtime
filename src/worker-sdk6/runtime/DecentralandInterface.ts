import { LoadableApis } from '../client'
import { componentNameRE, getIdAsNumber } from '../../common/Utils'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { RuntimeEventCallback } from './Events'
import { SceneRuntimeEventState } from './Events'
import { RpcClientModule } from '@dcl/rpc/dist/codegen'
import { ComponentBodyPayload, EntityAction } from '@dcl/protocol/out-ts/decentraland/sdk/ecs6/engine_interface_ecs6.gen'
import { EngineApiServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen'
import * as components from '@dcl/protocol/out-ts/decentraland/sdk/ecs6/components_ecs6.gen'

export interface DecentralandInterfaceOptions {
  onLog: (...args: any[]) => void
  onError: (e: Error) => void
  onEventFunctions: RuntimeEventCallback[]
  sceneId: string
  clientPort: RpcClientPort
  eventState: SceneRuntimeEventState
  batchEvents: { events: EntityAction[] }
  onStartFunctions: (() => void)[]
  onUpdateFunctions: ((dt: number) => void)[]
  EngineApi: RpcClientModule<EngineApiServiceDefinition>
}

export type GenericRpcModule = Record<string, (...args: any) => Promise<unknown>>
type ComposedRpcModule = ModuleDescriptor & { __INTERNAL_UNSAFE_loadedModule: GenericRpcModule }

export enum CLASS_ID {
  TRANSFORM = 1,
  UUID_CALLBACK = 8,
  BOX_SHAPE = 16,
  SPHERE_SHAPE = 17,
  PLANE_SHAPE = 18,
  CONE_SHAPE = 19,
  CYLINDER_SHAPE = 20,
  TEXT_SHAPE = 21,

  NFT_SHAPE = 22,
  UI_WORLD_SPACE_SHAPE = 23, // missing
  UI_SCREEN_SPACE_SHAPE = 24, // missing
  UI_CONTAINER_RECT = 25,
  UI_CONTAINER_STACK = 26,
  UI_TEXT_SHAPE = 27,
  UI_INPUT_TEXT_SHAPE = 28,
  UI_IMAGE_SHAPE = 29,
  UI_SLIDER_SHAPE = 30,
  CIRCLE_SHAPE = 31,
  BILLBOARD = 32,

  ANIMATION = 33,
  FONT = 34,

  UI_FULLSCREEN_SHAPE = 40, // missing
  UI_BUTTON_SHAPE = 41,

  GLTF_SHAPE = 54,
  OBJ_SHAPE = 55,
  AVATAR_SHAPE = 56,

  BASIC_MATERIAL = 64,
  PBR_MATERIAL = 65,

  HIGHLIGHT_ENTITY = 66, // missing

  /** @deprecated Sound has been deprecataed */
  SOUND = 67,  // missing
  TEXTURE = 68,

  VIDEO_CLIP = 70,
  VIDEO_TEXTURE = 71,

  AVATAR_TEXTURE = 72,

  AUDIO_CLIP = 200,
  AUDIO_SOURCE = 201,
  AUDIO_STREAM = 202,
  GIZMOS = 203,
  SMART_ITEM = 204,  // missing
  AVATAR_MODIFIER_AREA = 205,
  AVATAR_ATTACH = 206,
  CAMERA_MODE_AREA = 207,

  // For state sync only
  NAME = 300, // missing
  LOCKED_ON_EDIT = 301, // missing
  VISIBLE_ON_EDIT = 302 // missing
}

const classIdToKey: Map<number, { key: string; component: string}> = new Map([
  [CLASS_ID.AVATAR_MODIFIER_AREA, {key:'avatarModifierArea', component: 'ECS6ComponentAvatarModifierArea'}],
  [CLASS_ID.TRANSFORM, {key:'transform', component: 'ECS6ComponentTransform'}],
  [CLASS_ID.AVATAR_ATTACH, {key:'attachToAvatar', component: 'ECS6ComponentAttachToAvatar'}],
  [CLASS_ID.BILLBOARD, {key:'billboard', component: 'ECS6ComponentBillboard'}],
  [CLASS_ID.BOX_SHAPE, {key:'boxShape', component: 'ECS6ComponentBoxShape'}],
  [CLASS_ID.SPHERE_SHAPE, {key:'sphereShape', component: 'ECS6ComponentSphereShape'}],
  [CLASS_ID.CIRCLE_SHAPE, {key:'circleShape', component: 'ECS6ComponentCircleShape'}],
  [CLASS_ID.PLANE_SHAPE, {key:'planeShape', component: 'ECS6ComponentPlaneShape'}],
  [CLASS_ID.CONE_SHAPE, {key:'coneShape', component: 'ECS6ComponentConeShape'}],
  [CLASS_ID.CYLINDER_SHAPE, {key:'cylinderShape', component: 'ECS6ComponentCylinderShape'}],
  [CLASS_ID.GLTF_SHAPE, {key:'gltfShape', component: 'ECS6ComponentGltfShape'}],
  [CLASS_ID.NFT_SHAPE, {key:'nftShape', component: 'ECS6ComponentNftShape'}],
  [CLASS_ID.TEXTURE, {key:'texture', component: 'ECS6ComponentTexture'}],
  [CLASS_ID.ANIMATION, {key:'animator', component: 'ECS6ComponentAnimator'}],
  [CLASS_ID.OBJ_SHAPE, {key:'objShape', component: 'ECS6ComponentObjShape'}],
  [CLASS_ID.FONT, {key:'font', component: 'ECS6ComponentFont'}],
  [CLASS_ID.TEXT_SHAPE, {key:'textShape', component: 'ECS6ComponentTextShape'}],
  [CLASS_ID.PBR_MATERIAL, {key:'material', component: 'ECS6ComponentMaterial'}],
  [CLASS_ID.BASIC_MATERIAL, {key:'basicMaterial', component: 'ECS6ComponentBasicMaterial'}],
  [CLASS_ID.UUID_CALLBACK, {key:'uuidCallback', component: 'ECS6ComponentUuidCallback'}],
  [CLASS_ID.SMART_ITEM, {key:'smartItem', component: 'ECS6ComponentSmartItem'}],
  [CLASS_ID.VIDEO_CLIP, {key:'videoClip', component: 'ECS6ComponentVideoClip'}],
  [CLASS_ID.VIDEO_TEXTURE, {key:'videoTexture', component: 'ECS6ComponentVideoTexture'}],
  [CLASS_ID.CAMERA_MODE_AREA, {key:'cameraModeArea', component: 'ECS6ComponentCameraModeArea'}],
  [CLASS_ID.AVATAR_TEXTURE, {key:'avatarTexture', component: 'ECS6ComponentAvatarTexture'}],
  [CLASS_ID.AUDIO_CLIP, {key:'audioClip', component: 'ECS6ComponentAudioClip'}],
  [CLASS_ID.AUDIO_SOURCE, {key:'audioSource', component: 'ECS6ComponentAudioSource'}],
  [CLASS_ID.AUDIO_STREAM, {key:'audioStream', component: 'ECS6ComponentAudioStream'}],
  [CLASS_ID.AVATAR_SHAPE, {key:'avatarShape', component: 'ECS6ComponentAvatarShape'}],
  [CLASS_ID.GIZMOS, {key:'gizmos', component: 'ECS6ComponentGizmos'}],
  [CLASS_ID.UI_CONTAINER_RECT, {key:'uiContainerRect', component: 'ECS6ComponentUiContainerRect'}],
  [CLASS_ID.UI_CONTAINER_STACK, {key:'uiContainerStack', component: 'ECS6ComponentUiContainerStack'}],
  [CLASS_ID.UI_BUTTON_SHAPE, {key:'uiButton', component: 'ECS6ComponentUiButton'}],
  [CLASS_ID.UI_TEXT_SHAPE, {key:'uiText', component: 'ECS6ComponentUiText'}],
  [CLASS_ID.UI_INPUT_TEXT_SHAPE, {key:'uiInputText', component: 'ECS6ComponentUiInputText'}],
  [CLASS_ID.UI_IMAGE_SHAPE, {key:'uiImage', component: 'ECS6ComponentUiImage'}],
  [CLASS_ID.UI_SLIDER_SHAPE, {key:'uiScrollRect', component: 'ECS6ComponentUiScrollRect'}],
  [CLASS_ID.UI_WORLD_SPACE_SHAPE, { key : 'uiWorldSpaceShape', component: 'ECS6ComponentUiWorldSpaceShape'}],
  [CLASS_ID.UI_SCREEN_SPACE_SHAPE, { key : 'uiScreenSpaceShape', component: 'ECS6ComponentUiScreenSpaceShape'}],
  [CLASS_ID.UI_FULLSCREEN_SHAPE, { key : 'uiFullscreenShape', component: 'ECS6ComponentUiFullscreenShape'}]
])

function getValue(classId: number, json: string, onLog: (...args: any[]) => void) {
  const component = classIdToKey.get(classId)
  if (component == null) {
    onLog(`SceneRuntime getValue fails with classId ${classId}`, { json } )
    return undefined
  }
  const pbValue = (components as any)[component.component].fromJSON(JSON.parse(json))
  return { payload: {$case: component.key, [component.key]: pbValue }}  as ComponentBodyPayload
}

export function createDecentralandInterface(options: DecentralandInterfaceOptions) {
  const { batchEvents, onError, onLog, sceneId, onEventFunctions, clientPort, eventState } = options

  const sceneLoadedModules: Record<string, ComposedRpcModule> = {}
  const componentIdClassIdMap: Map<string, number> = new Map()

  const dcl: DecentralandInterface = {
    DEBUG: true,
    log(...args: any[]) {
      onLog(...args)
    },

    openExternalUrl(url: string) {
      try {
        const u = new URL(url)
        if (u.protocol !== 'https:') throw new Error('Only https: external links are allowed')
      } catch (err: any) {
        onError(err)
        return
      }

      if (JSON.stringify(url).length > 49000) {
        onError(new Error('URL payload cannot exceed 49.000 bytes'))
        return
      }

      if (eventState.allowOpenExternalUrl) {
        batchEvents.events.push({
          tag: '',
          payload: { payload: { $case: 'openExternalUrl', openExternalUrl: { url } } }
        })
      } else {
        this.error('openExternalUrl can only be used inside a pointerEvent')
      }
    },

    openNFTDialog(assetContractAddress: string, tokenId: string, comment: string | null) {
      if (eventState.allowOpenExternalUrl) {
        const payloadLength = assetContractAddress.length + tokenId.length + (comment?.length || 0)

        if (payloadLength > 49000) {
          onError(new Error('OpenNFT payload cannot exceed 49.000 bytes'))
          return
        }

        batchEvents.events.push({
          tag: '',
          payload: { payload: { $case: 'openNftDialog', openNftDialog: { assetContractAddress, tokenId, comment: comment || '' } } }
        })
      } else {
        this.error('openNFTDialog can only be used inside a pointerEvent')
      }
    },

    addEntity(entityId: string) {
      if (entityId === '0') {
        // We dont create the entity 0 in the engine.
        return
      }
      batchEvents.events.push({
        payload: { payload: { $case: 'createEntity', createEntity: { id: entityId } } }
      })
    },

    removeEntity(entityId: string) {
      batchEvents.events.push({
        payload: { payload: { $case: 'removeEntity', removeEntity: { id: entityId } } }
      })
    },

    /** update tick */
    onUpdate(cb: (deltaTime: number) => void): void {
      if (typeof (cb as any) !== 'function') {
        onError(new Error('onUpdate must be called with only a function argument'))
      } else {
        options.onUpdateFunctions.push(cb)
      }
    },

    /** event from the engine */
    onEvent(cb: (event: any) => void): void {
      if (typeof (cb as any) !== 'function') {
        onError(new Error('onEvent must be called with only a function argument'))
      } else {
        onEventFunctions.push(cb)
      }
    },

    /** called after adding a component to the entity or after updating a component */
    updateEntityComponent(entityId: string, componentName: string, classId: number, json: string): void {
      if (json.length > 49000) {
        onError(new Error('Component payload cannot exceed 49.000 bytes'))
        return
      }

      if (componentNameRE.test(componentName)) {
        batchEvents.events.push({
          tag: sceneId + '_' + entityId + '_' + classId,
          payload: {
            payload: {
              $case: 'updateEntityComponent', updateEntityComponent: {
                entityId,
                classId,
                name: componentName.replace(componentNameRE, ''),
                componentData: getValue(classId, json, onLog)
              }
            }
          }
        })
      }
    },

    /** called after adding a DisposableComponent to the entity */
    attachEntityComponent(entityId: string, componentName: string, id: string): void {
      if (componentNameRE.test(componentName)) {
        batchEvents.events.push({
          tag: entityId,
          payload: {
            payload: {
              $case: 'attachEntityComponent', attachEntityComponent: {
                entityId,
                name: componentName.replace(componentNameRE, ''),
                id
              }
            }
          }
        })
      }
    },

    /** call after removing a component from the entity */
    removeEntityComponent(entityId: string, componentName: string): void {
      if (componentNameRE.test(componentName)) {
        batchEvents.events.push({
          tag: entityId,
          payload: {
            payload: {
              $case: 'componentRemoved', componentRemoved: {
                entityId,
                name: componentName.replace(componentNameRE, '')
              }
            }
          }
        })
      }
    },

    /** set a new parent for the entity */
    setParent(entityId: string, parentId: string): void {
      batchEvents.events.push({
        tag: entityId,
        payload: {
          payload: {
            $case: 'setEntityParent',
            setEntityParent: {
              entityId,
              parentId
            }
          }
        }
      })
    },

    /** queries for a specific system with a certain query configuration */
    query(queryType: any, payload: any) {
      payload.queryId = getIdAsNumber(payload.queryId).toString()
      batchEvents.events.push({
        tag: sceneId + '_' + payload.queryId,
        payload: {
          payload: {
            $case: 'query',
            query: {
              queryId: queryType,
              payload
            }
          }
        }
      })
    },

    /** subscribe to specific events, events will be handled by the onEvent function */
    subscribe(eventName: string): void {
      options.EngineApi.subscribe({ eventId: eventName }).catch((err: Error) => onError(err))
    },

    /** unsubscribe to specific event */
    unsubscribe(eventName: string): void {
      options.EngineApi.unsubscribe({ eventId: eventName }).catch((err: Error) => onError(err))
    },

    componentCreated(id: string, componentName: string, classId: number) {
      if (componentNameRE.test(componentName)) {
        componentIdClassIdMap.set(id, classId)
        batchEvents.events.push({
          tag: id,
          payload: {
            payload: {
              $case: 'componentCreated', componentCreated: {
                id,
                classId,
                name: componentName.replace(componentNameRE, '')
              }
            }
          }
        })
      }
    },

    componentDisposed(id: string) {
      componentIdClassIdMap.delete(id)
      batchEvents.events.push({
        tag: id,
        payload: {
          payload: { $case: 'componentDisposed', componentDisposed: { id } }
        }
      })
    },

    componentUpdated(id: string, json: string) {
      const classId = componentIdClassIdMap.get(id)
      if (classId) {
        batchEvents.events.push({
          tag: id,
          payload: {
            payload: {
              $case: 'componentUpdated', componentUpdated: {
                id,
                componentData: getValue(classId, json, onLog)
              }
            }
          }
        })
      }
    },

    loadModule: async (_moduleName) => {
      if (!(_moduleName in sceneLoadedModules)) {
        const loadedModule = loadSceneModule(clientPort, _moduleName)
        sceneLoadedModules[_moduleName] = {
          rpcHandle: _moduleName,
          __INTERNAL_UNSAFE_loadedModule: loadedModule,
          methods: Object.keys(loadedModule).map((name) => ({ name }))
        }
      }

      return sceneLoadedModules[_moduleName]
    },
    callRpc: async (rpcHandle: string, methodName: string, args: any[]) => {
      const module = sceneLoadedModules[rpcHandle]
      if (!module) {
        throw new Error(`RPCHandle: ${rpcHandle} is not loaded`)
      }
      // eslint-disable-next-line prefer-spread
      return module.__INTERNAL_UNSAFE_loadedModule[methodName].apply(module, args)
    },
    onStart(cb: () => void) {
      options.onStartFunctions.push(cb)
    },
    error(message, data) {
      onError(Object.assign(new Error(message as string), { data }))
    }
  }

  return dcl
}

export function loadSceneModule(clientPort: RpcClientPort, moduleName: string): GenericRpcModule {
  // - moduleNames that start with @decentraland are from ECS6 and they should load the legacy ones.
  // - moduleNames that start with ~system, are the new ones that follow the protocol buffer generation
  //    (a single object as @param, and a single object as @returns)
  const moduleToLoad = moduleName.replace(/^@decentraland\//, 'Legacy').replace(/^~system\//, '')
  try {
    if (moduleToLoad in LoadableApis) {
      return (LoadableApis as any)[moduleToLoad](clientPort)
    } else {
      throw new Error('The module is not available in the list!')
    }
  } catch (e: any) {
    throw Object.assign(new Error(`Error getting the methods of ${moduleToLoad}: ` + e.message), {
      original: e
    })
  }
}
