#!/usr/bin/env node

/// <reference types="node" />

import type { ChildProcess } from "child_process"

import { runIvm } from "./vm"
import { readFileSync } from "fs"
import { resolve } from "path"
import * as inspector from "inspector"
import { Transport, TransportEvents } from "@dcl/rpc"
import mitt from "mitt"

function exit(err?: Error) {
  if (err) {
    console.error(err)
  }
  inspector.close()
  process.exit(err ? 1 : 0)
}

function IPCTransport(process: NodeJS.Process | ChildProcess): Transport {
  const events = mitt<TransportEvents>()

  process.on("disconnect", () => events.emit("close", {}))

  process.on("message", (message) => {
    console.dir(message)
    if (message instanceof Uint8Array) {
      events.emit("message", message)
    } else {
      throw new Error(`IPCTransport: Received unknown type of message, expecting Uint8Array`)
    }
  })

  const api: Transport = {
    ...events,
    sendMessage(message) {
      if (message instanceof ArrayBuffer || message instanceof Uint8Array) {
        if (process.send) process.send(message)
      } else {
        throw new Error(`WebWorkerTransport: Received unknown type of message, expecting Uint8Array`)
      }
    },
    close() {
      if ("exit" in process) {
        process.exit(0)
      } else {
        process.kill()
      }
    },
  }

  return api
}

async function run() {
  if (!process.send) {
    throw new Error("Impossible to start application, no IPC pipe was set")
  }

  if (!inspector.url()) inspector.open()

  const inspectorSession = new inspector.Session()

  inspectorSession.connect()

  const scene = JSON.parse(readFileSync("scene.json").toString())

  // resolve absolute path, it is necessary to resolve the sourceMaps
  const sceneJsonFile = resolve(scene.main)
  const sceneJsonContent = readFileSync(sceneJsonFile).toString()

  console.log(`> will load file: ${sceneJsonFile}`)

  const transport = IPCTransport(process)

  const [runtime] = await runIvm(sceneJsonContent, sceneJsonFile, transport)

  console.log("> awaiting scene to run")

  await runtime

  console.log("> exiting2")
}

process.setUncaughtExceptionCaptureCallback(exit)

// handle kill
process.on("SIGTERM", () => exit())

// handle ctrl-c
process.on("SIGINT", () => exit())

run().catch(exit)
