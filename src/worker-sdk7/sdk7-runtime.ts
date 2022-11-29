import { RpcClientPort } from '@dcl/rpc'
import { LoadableApis } from './client'
import { DevToolsAdapter } from './client/DevToolsAdapter'

export type GenericRpcModule = Record<string, (...args: any) => Promise<unknown>>

export type SceneInterface = {
  onUpdate(dt: number): Promise<void>
  onStart(): Promise<void>
}

export type SDK7Module = {
  readonly exports: Partial<SceneInterface>
}

export function createRuntime(runtime: Record<string, any>, clientPort: RpcClientPort, devtools: DevToolsAdapter): SDK7Module {
  const exports: Partial<SceneInterface> = {}

  const module = { exports }

  Object.defineProperty(runtime, 'module', {
    configurable: false,
    get() {
      return module
    }
  })

  Object.defineProperty(runtime, 'exports', {
    configurable: false,
    get() {
      return module.exports
    }
  })

  Object.defineProperty(runtime, 'console', {
    value: {
      log: devtools.log.bind(devtools),
      info: devtools.log.bind(devtools),
      debug: devtools.log.bind(devtools),
      trace: devtools.log.bind(devtools),
      warning: devtools.error.bind(devtools),
      error: devtools.error.bind(devtools)
    }
  })

  const loadedModules: Record<string, GenericRpcModule> = {}

  Object.defineProperty(runtime, 'require', {
    configurable: false,
    value: (moduleName: string) => {
      if (moduleName in loadedModules) return loadedModules[moduleName]
      const module = loadSceneModule(clientPort, moduleName)
      loadedModules[moduleName] = module
      return module
    }
  })

  return {
    get exports() {
      return module.exports
    }
  }
}

function loadSceneModule(clientPort: RpcClientPort, moduleName: string): GenericRpcModule {
  const moduleToLoad = moduleName.replace(/^~system\//, '')
  if (moduleToLoad in LoadableApis) {
    return (LoadableApis as any)[moduleToLoad](clientPort)
  } else {
    throw new Error(`Unknown module ${moduleName}`)
  }
}
