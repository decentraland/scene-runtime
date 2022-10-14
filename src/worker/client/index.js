"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadableAPIs = void 0;
const CommunicationsController_1 = require("./CommunicationsController");
const DevTools_1 = require("./DevTools");
const EngineAPI_1 = require("./EngineAPI");
const EnvironmentAPI_1 = require("./EnvironmentAPI");
const EthereumController_1 = require("./EthereumController");
const ExperimentalAPI_1 = require("./ExperimentalAPI");
const ParcelIdentity_1 = require("./ParcelIdentity");
const Permissions_1 = require("./Permissions");
const Players_1 = require("./Players");
const PortableExperiences_1 = require("./PortableExperiences");
const RestrictedActions_1 = require("./RestrictedActions");
const SignedFetch_1 = require("./SignedFetch");
const SocialController_1 = require("./SocialController");
const UserActionModule_1 = require("./UserActionModule");
const UserIdentity_1 = require("./UserIdentity");
const Web3Provider_1 = require("./Web3Provider");
exports.LoadableAPIs = {
    DevTools: DevTools_1.createDevToolsServiceClient,
    EngineAPI: EngineAPI_1.createEngineAPIServiceClient,
    ExperimentalAPI: ExperimentalAPI_1.createExperimentalAPIServiceClient,
    Permissions: Permissions_1.createPermissionsServiceClient,
    SignedFetch: SignedFetch_1.SignedFetchServiceClient.create,
    CommunicationsController: CommunicationsController_1.CommunicationsControllerServiceClient.create,
    EnvironmentAPI: EnvironmentAPI_1.EnvironmentAPIServiceClient.create,
    EthereumController: EthereumController_1.EthereumControllerServiceClient.create,
    ParcelIdentity: ParcelIdentity_1.ParcelIdentityServiceClient.create,
    Players: Players_1.PlayersServiceClient.create,
    PortableExperience: PortableExperiences_1.PortableExperienceServiceClient.create,
    RestrictedActions: RestrictedActions_1.RestrictedActionsServiceClient.create,
    UserActionModule: UserActionModule_1.UserActionModuleServiceClient.create,
    UserIdentity: UserIdentity_1.UserIdentityServiceClient.create,
    // Legacy
    LegacySignedFetch: SignedFetch_1.SignedFetchServiceClient.createLegacy,
    LegacyCommunicationsController: CommunicationsController_1.CommunicationsControllerServiceClient.createLegacy,
    LegacyEnvironmentAPI: EnvironmentAPI_1.EnvironmentAPIServiceClient.createLegacy,
    LegacyEthereumController: EthereumController_1.EthereumControllerServiceClient.createLegacy,
    LegacyParcelIdentity: ParcelIdentity_1.ParcelIdentityServiceClient.createLegacy,
    LegacyPlayers: Players_1.PlayersServiceClient.createLegacy,
    LegacyPortableExperience: PortableExperiences_1.PortableExperienceServiceClient.createLegacy,
    // TODO: validate which of the following is actually used.
    LegacyRestrictedActions: RestrictedActions_1.RestrictedActionsServiceClient.createLegacy,
    LegacyRestrictedActionModule: RestrictedActions_1.RestrictedActionsServiceClient.createLegacy,
    LegacyUserActionModule: UserActionModule_1.UserActionModuleServiceClient.createLegacy,
    // This is UserIdentity in the host-side
    LegacyIdentity: UserIdentity_1.UserIdentityServiceClient.createLegacy,
    // This is required by the scenes
    ['Legacyweb3-provider']: Web3Provider_1.createLegacyWeb3Provider,
    LegacySocialController: SocialController_1.createSocialControllerServiceClient
};
