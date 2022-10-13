import * as codegen from '@dcl/rpc/dist/codegen'
import { RpcClientPort } from '@dcl/rpc/dist/types'
import type { Scene } from '@dcl/schemas/dist/platform/scene/index'
import type { ContentMapping } from '@dcl/schemas/dist/misc/content-mapping'
import { ParcelIdentityServiceDefinition } from '@dcl/protocol/out-ts/decentraland/kernel/apis/parcel_identity.gen'

export type MappingsResponse = {
  parcel_id: string
  root_cid: string
  contents: Array<ContentMapping>
}

export interface ILand {
  /**
   * sceneId: Now it is either an internal identifier or the rootCID.
   * In the future will change to the sceneCID
   */
  sceneId: string
  sceneJsonData: Scene
  baseUrl: string
  baseUrlBundles: string
  mappingsResponse: MappingsResponse
}

export namespace ParcelIdentityServiceClient {
  export function create<Context extends {}>(clientPort: RpcClientPort) {
    return codegen.loadService<Context, ParcelIdentityServiceDefinition>(clientPort, ParcelIdentityServiceDefinition)
  }

  export function createLegacy<Context extends {}>(clientPort: RpcClientPort) {
    const originalService = codegen.loadService<Context, ParcelIdentityServiceDefinition>(
      clientPort,
      ParcelIdentityServiceDefinition
    )

    return {
      ...originalService,

      /**
       * Returns the coordinates and the definition of a parcel
       */
      async getParcel(): Promise<{ land: ILand; cid: string }> {
        const data = await originalService.getParcel({})
        return {
          land: {
            sceneId: data.land?.sceneId || '',
            sceneJsonData: JSON.parse(data.land?.sceneJsonData || '{}'),
            baseUrl: data.land?.baseUrl || '',
            baseUrlBundles: data.land?.baseUrlBundles || '',
            mappingsResponse: {
              root_cid: data.land?.mappingsResponse?.rootCid || '',
              parcel_id: data.land?.mappingsResponse?.parcelId || '',
              contents: data.land?.mappingsResponse?.contents || []
            }
          },
          cid: data.cid
        }
      },

      /**
       * Returns the scene id
       */
      async getSceneId(): Promise<string> {
        const data = await originalService.getSceneId({})
        return data.sceneId
      }
    }
  }
}
