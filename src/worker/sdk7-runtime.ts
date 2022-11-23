import { RpcClientPort } from "@dcl/rpc"
import { GenericRpcModule, loadSceneModule } from "./runtime/DecentralandInterface"

export type SceneInterface = {
  onUpdate(dt: number): Promise<void>
  onStart(): Promise<void>
}

export type SDK7Module = {
  readonly exports: Partial<SceneInterface>
}

export function createRuntime(runtime: Record<string, any>, clientPort: RpcClientPort): SDK7Module {
  const exports: Partial<SceneInterface> = {}

  const module = Object.seal({ exports })

  Object.defineProperty(runtime, "module", {
    configurable: false,
    get() {
      return module
    },
  })

  const loadedModules: Record<string, GenericRpcModule> = {}

  Object.defineProperty(runtime, "require", {
    configurable: false,
    value: (moduleName: string) => {
      if (moduleName in loadedModules) return loadedModules[moduleName]
      const module = loadSceneModule(clientPort, moduleName)
      loadedModules[moduleName] = module
      return module
    },
  })

  return {
    get exports() {
      return module.exports
    },
  }
}
