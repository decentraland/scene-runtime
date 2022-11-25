import { CommunicationsControllerServiceClient } from './CommunicationsController'
import { createDevToolsServiceClient } from './DevTools'
import { createEngineApiServiceClient } from './EngineApi'
import { EnvironmentApiServiceClient } from './EnvironmentApi'
import { EthereumControllerServiceClient } from './EthereumController'
import { ParcelIdentityServiceClient } from './ParcelIdentity'
import { createPermissionsServiceClient } from './Permissions'
import { PlayersServiceClient } from './Players'
import { PortableExperienceServiceClient } from './PortableExperiences'
import { RestrictedActionsServiceClient } from './RestrictedActions'
import { SignedFetchServiceClient } from './SignedFetch'
import { createSocialControllerServiceClient } from './SocialController'
import { UserActionModuleServiceClient } from './UserActionModule'
import { UserIdentityServiceClient } from './UserIdentity'
import { createLegacyWeb3Provider } from './Web3Provider'

export const LoadableApis = {
  DevTools: createDevToolsServiceClient,
  EngineApi: createEngineApiServiceClient,
  Permissions: createPermissionsServiceClient,

  EnvironmentApi: EnvironmentApiServiceClient.create,

  // Legacy
  LegacySignedFetch: SignedFetchServiceClient.createLegacy,
  LegacyCommunicationsController: CommunicationsControllerServiceClient.createLegacy,
  LegacyEnvironmentAPI: EnvironmentApiServiceClient.createLegacy,
  LegacyEthereumController: EthereumControllerServiceClient.createLegacy,
  LegacyParcelIdentity: ParcelIdentityServiceClient.createLegacy,
  LegacyPlayers: PlayersServiceClient.createLegacy,
  LegacyPortableExperience: PortableExperienceServiceClient.createLegacy,

  // TODO: validate which of the following is actually used.
  LegacyRestrictedActions: RestrictedActionsServiceClient.createLegacy,
  LegacyRestrictedActionModule: RestrictedActionsServiceClient.createLegacy,

  LegacyUserActionModule: UserActionModuleServiceClient.createLegacy,
  // This is UserIdentity in the host-side
  LegacyIdentity: UserIdentityServiceClient.createLegacy,

  // This is required by the scenes
  ['Legacyweb3-provider']: createLegacyWeb3Provider,

  LegacySocialController: createSocialControllerServiceClient
}

export type ILoadedModules<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any ? Awaited<ReturnType<T[K]>> : never
}

export type LoadedModules = ILoadedModules<typeof LoadableApis>
