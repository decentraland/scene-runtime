import type { RpcClientPort } from '@dcl/rpc'
import { createFetch } from '../common/Fetch'
import { createWebSocket } from '../common/WebSocket'
import { LoadableApis } from './client'

export type GenericRpcModule = Record<string, (...args: any) => Promise<unknown>>

export type SceneInterface = {
  onUpdate(dt: number): Promise<void>
  onStart(): Promise<void>
}

export type SDK7Module = {
  readonly exports: Partial<SceneInterface>
  runStart(): Promise<void>
  runUpdate(deltaTime: number): Promise<void>
}

export type ConsoleType = {
  log(...args: any[]): void
  error(...args: any[]): void
}

export function createWsFetchRuntime(
  runtime: Record<string, any>,
  options: { canUseWebsocket: boolean; canUseFetch: boolean; previewMode: boolean },
  console: ConsoleType
) {
  const originalFetch = globalThis.fetch

  const restrictedWebSocket = createWebSocket({ ...options, log: console.log.bind(console) })
  const restrictedFetch = createFetch({ ...options, originalFetch, log: console.log.bind(console) })

  Object.defineProperty(runtime, 'WebSocket', {
    configurable: false,
    value: restrictedWebSocket
  })

  Object.defineProperty(runtime, 'fetch', {
    configurable: false,
    value: restrictedFetch
  })
}

export function createModuleRuntime(
  runtime: Record<string, any>,
  clientPort: RpcClientPort,
  console: ConsoleType
): SDK7Module {
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
      log: console.log.bind(console),
      info: console.log.bind(console),
      debug: console.log.bind(console),
      trace: console.log.bind(console),
      warning: console.error.bind(console),
      error: console.error.bind(console)
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

  const setImmediateList: Array<() => Promise<void>> = []

  Object.defineProperty(runtime, 'setImmediate', {
    configurable: false,
    value: (fn: () => Promise<void>) => {
      setImmediateList.push(fn)
    }
  })

  async function runSetImmediate(): Promise<void> {
    if (setImmediateList.length) {
      for (const fn of setImmediateList) {
        try {
          await fn()
        } catch (err: any) {
          console.error(err)
        }
      }
      setImmediateList.length = 0
    }
  }

  return {
    get exports() {
      return module.exports
    },
    async runStart() {
      if (module.exports.onStart) {
        try {
          await module.exports.onStart()
        } catch (err: any) {
          console.error(err)
        }
      }
      await runSetImmediate()
    },
    async runUpdate(deltaTime: number) {
      if (module.exports.onUpdate) {
        try {
          await module.exports.onUpdate(deltaTime)
        } catch (err: any) {
          console.error(err)
        }
      }
      await runSetImmediate()
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
