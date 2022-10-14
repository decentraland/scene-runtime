import WebSocket from "ws"
globalThis.WebSocket = WebSocket as any
import { createWebSocket } from "../src/worker/WebSocket"

class FakeWebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {}
}

describe("Websocket wrapped for scenes", () => {
  let originalWebSocket: any = WebSocket
  beforeAll(() => {
    originalWebSocket = WebSocket
    // @ts-ignore
    globalThis.WebSocket = FakeWebSocket
  })

  afterAll(() => {
    globalThis.WebSocket = originalWebSocket
    originalWebSocket = null
  })
  const log = jest.fn()
  const logPreview = jest.fn()
  const wrappedProductionWebSocket = createWebSocket({
    canUseWebsocket: true,
    log,
    previewMode: false,
  })
  const wrappedPreviewWebSocket = createWebSocket({
    canUseWebsocket: true,
    log: logPreview,
    previewMode: true,
  })
  const wrappedNotAllowedWebSocket = createWebSocket({
    canUseWebsocket: false,
    log,
    previewMode: false,
  })

  it("should run successfully if the ws is secure in deployed scenes", async () => {
    const a = new wrappedProductionWebSocket("wss://rpc.decentraland.org/mainnet")
    a.onopen = () => a.close()
  })

  it("should throw an error if the ws is not secure in deployed scenes", async () => {
    expect(() => {
      new wrappedProductionWebSocket("http://decentraland.org")
    }).toThrow()
  })

  it("should run successfully if the ws is secure in preview scenes", async () => {
    const a = new wrappedPreviewWebSocket("wss://rpc.decentraland.org/mainnet")
    a.onopen = () => a.close()
  })

  it("should log an error if the ws is not secure in preview scenes", async () => {
    jest.resetAllMocks()
    expect(logPreview).not.toHaveBeenCalled()
    logPreview.mockImplementationOnce(() => {
      throw new Error("Called")
    })
    expect(() => new wrappedPreviewWebSocket("ws://rpc.decentraland.org/mainnet")).toThrow("Called")
  })

  it("should throw an error because it does not have permissions", async () => {
    expect(() => {
      new wrappedNotAllowedWebSocket("wss://rpc.decentraland.org/mainnet")
    }).toThrow()
  })
})
