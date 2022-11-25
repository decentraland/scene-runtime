import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import { ParcelIdentityServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/parcel_identity.gen'
import { PlayersServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/players.gen'
import { PortableExperiencesServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/portable_experiences.gen'
import { RestrictedActionsServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/restricted_actions.gen'
import { UserActionModuleServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/user_action_module.gen'
import { UserIdentityServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/user_identity.gen'
import { SignedFetchServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/signed_fetch.gen'
import { CommunicationsControllerServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/communications_controller.gen'
import { EnvironmentApiServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/environment_api.gen'
import { EthereumControllerServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/ethereum_controller.gen'
import { DevToolsServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/dev_tools.gen'
import { EngineApiServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/engine_api.gen'
import { PermissionsServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/permissions.gen'
import { createLegacyWeb3Provider } from './Web3Provider'

export const LoadableApis = {
  // TODO: Review final API before public launch
  DevTools<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, DevToolsServiceDefinition>(clientPort, DevToolsServiceDefinition)
  },
  // TODO: Review final API before public launch
  EngineApi<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, EngineApiServiceDefinition>(clientPort, EngineApiServiceDefinition)
  },
  // TODO: Review final API before public launch
  Permissions<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, PermissionsServiceDefinition>(clientPort, PermissionsServiceDefinition)
  },
  // TODO: Review final API before public launch
  SignedFetch<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, SignedFetchServiceDefinition>(clientPort, SignedFetchServiceDefinition)
  },
  // TODO: Review final API before public launch
  CommunicationsController<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, CommunicationsControllerServiceDefinition>(
      clientPort,
      CommunicationsControllerServiceDefinition
    )
  },
  // TODO: Review final API before public launch
  EnvironmentApi<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, EnvironmentApiServiceDefinition>(clientPort, EnvironmentApiServiceDefinition)
  },
  // TODO: Review final API before public launch
  EthereumController<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, EthereumControllerServiceDefinition>(
      clientPort,
      EthereumControllerServiceDefinition
    )
  },
  // TODO: Review final API before public launch
  ParcelIdentity<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, ParcelIdentityServiceDefinition>(clientPort, ParcelIdentityServiceDefinition)
  },
  // TODO: Review final API before public launch
  Players<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, PlayersServiceDefinition>(clientPort, PlayersServiceDefinition)
  },
  // TODO: Review final API before public launch
  PortableExperience<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, PortableExperiencesServiceDefinition>(
      clientPort,
      PortableExperiencesServiceDefinition
    )
  },
  // TODO: Review final API before public launch
  RestrictedActions<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, RestrictedActionsServiceDefinition>(
      clientPort,
      RestrictedActionsServiceDefinition
    )
  },
  // TODO: Review final API before public launch
  UserActionModule<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, UserActionModuleServiceDefinition>(
      clientPort,
      UserActionModuleServiceDefinition
    )
  },
  // TODO: Review final API before public launch
  UserIdentity<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, UserIdentityServiceDefinition>(clientPort, UserIdentityServiceDefinition)
  },

  ['web3-provider']: createLegacyWeb3Provider
}

export type ILoadedModules<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any ? Awaited<ReturnType<T[K]>> : never
}

export type LoadedModules = ILoadedModules<typeof LoadableApis>
