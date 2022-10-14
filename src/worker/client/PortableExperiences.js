"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortableExperienceServiceClient = void 0;
const codegen = require("@dcl/rpc/dist/codegen");
const portable_experiences_gen_1 = require("@dcl/protocol/out-ts/decentraland/kernel/apis/portable_experiences.gen");
var PortableExperienceServiceClient;
(function (PortableExperienceServiceClient) {
    function create(clientPort) {
        return codegen.loadService(clientPort, portable_experiences_gen_1.PortableExperiencesServiceDefinition);
    }
    PortableExperienceServiceClient.create = create;
    function createLegacy(clientPort) {
        const originalService = codegen.loadService(clientPort, portable_experiences_gen_1.PortableExperiencesServiceDefinition);
        return {
            ...originalService,
            /**
             * Starts a portable experience.
             * @param  {SpawnPortableExperienceParameters} [pid] - Information to identify the PE
             *
             * Returns the handle of the portable experience.
             */
            async spawn(pid) {
                return await originalService.spawn({ pid });
            },
            /**
             * Stops a portable experience. Only the executor that spawned the portable experience has permission to kill it.
             * @param  {string} [pid] - The portable experience process id
             *
             * Returns true if was able to kill the portable experience, false if not.
             */
            async kill(pid) {
                return (await originalService.kill({ pid })).status;
            },
            /**
             * Stops a portable experience from the current running portable scene.
             *
             * Returns true if was able to kill the portable experience, false if not.
             */
            async exit() {
                return (await originalService.exit({})).status;
            },
            /**
             *
             * Returns current portable experiences loaded with ids and parentCid
             */
            async getPortableExperiencesLoaded() {
                return {
                    portableExperiences: (await originalService.getPortableExperiencesLoaded({})).loaded
                };
            }
        };
    }
    PortableExperienceServiceClient.createLegacy = createLegacy;
})(PortableExperienceServiceClient = exports.PortableExperienceServiceClient || (exports.PortableExperienceServiceClient = {}));
