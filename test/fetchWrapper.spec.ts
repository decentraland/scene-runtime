import { Request, Response, Headers, fetch } from "undici"
Object.assign(globalThis, { Request, Response, Headers, fetch })

import { createFetch, FetchFunction } from "../src/worker/Fetch"

const originalFetch: FetchFunction = async (resource, init) => {
  return new Response() as any
}

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))

describe("Fetch Wrapped for scenes", () => {
  const log = jest.fn()
  const logPreview = jest.fn()
  const wrappedProductionFetch = createFetch({
    canUseFetch: true,
    log,
    originalFetch,
    previewMode: false,
  })
  const wrappedPreviewFetch = createFetch({
    canUseFetch: true,
    log: logPreview,
    originalFetch,
    previewMode: true,
  })
  const wrappedNotAllowedFetch = createFetch({
    canUseFetch: false,
    log,
    originalFetch,
    previewMode: false,
  })

  const timePerFetchSleep = 100
  const wrappedDelayFetch = createFetch({
    canUseFetch: true,
    log,
    originalFetch: (async (_resource: any, init: any) => {
      await sleep(timePerFetchSleep)

      if (init!.signal?.aborted) {
        const a = new Error("AbortError")
        a.name = "AbortError"
        throw a
      }

      return new Response("Done", init as any)
    }) as any,
    previewMode: true,
  })

  // *
  // * Deployed mode test
  // *

  it("should run successfully if the url is secure in deployed scenes", async () => {
    await wrappedProductionFetch("https://decentraland.org")
  })

  it("should throw an error if the url is not secure in deployed scenes", async () => {
    await expect(async () => {
      await wrappedProductionFetch("http://decentraland.org")
    }).rejects.toThrow()
  })

  // *
  // * Preview mode test
  // *

  it("should run successfully if the url is secure in preview scenes", async () => {
    await wrappedPreviewFetch("https://decentraland.org")
  })

  it("should log an error if the url is not secure in preview scenes", async () => {
    expect(logPreview).not.toHaveBeenCalled()
    await wrappedPreviewFetch("http://decentraland.org")
    expect(logPreview).toHaveBeenCalled()
  })

  // *
  // * Not allowed fetchs mode test
  // *

  it("should throw an error because it does not have permissions", async () => {
    await expect(async () => {
      await wrappedNotAllowedFetch("https://decentraland.org")
    }).rejects.toThrow()
  })

  it("should execute only one fetch at the same time", async () => {
    let counter = 0
    const N = 10
    for (let i = 0; i < N; i++) {
      wrappedDelayFetch("https://test.test/").then(() => counter++)
    }
    await sleep(timePerFetchSleep * 1.2)
    expect(counter).toEqual(1)
    await sleep(timePerFetchSleep * 2)
    expect(counter).toEqual(3)
  })

  it("should abort fetch if reaches the timeout opt 1", async () => {
    await expect(wrappedDelayFetch("https://test.test/", { timeout: 10 })).rejects.toThrow("AbortError")
  })

  it("should abort fetch if reaches the timeout opt 2", async () => {
    let counter = 0
    const result = await Promise.all([
      wrappedDelayFetch("https://deelay.me/1000/https://decentraland.org", { timeout: 1 }).catch((err) => {
        counter++
      }),
      wrappedDelayFetch("https://decentraland.org", {}).then(() => counter++),
    ])

    expect(counter).toEqual(2)
    expect(result).toEqual([undefined, 1])
  })
})
