#!/usr/bin/env node
"use strict";
/// <reference types="node" />
Object.defineProperty(exports, "__esModule", { value: true });
const vm_1 = require("./vm");
const fs_1 = require("fs");
const path_1 = require("path");
const inspector = require("inspector");
const mitt_1 = require("mitt");
function exit(err) {
    if (err) {
        console.error(err);
    }
    inspector.close();
    process.exit(err ? 1 : 0);
}
function IPCTransport(process) {
    const events = (0, mitt_1.default)();
    process.on("disconnect", () => events.emit("close", {}));
    process.on("message", (message) => {
        console.dir(message);
        if (message instanceof Uint8Array) {
            events.emit("message", message);
        }
        else {
            throw new Error(`IPCTransport: Received unknown type of message, expecting Uint8Array`);
        }
    });
    const api = {
        ...events,
        sendMessage(message) {
            if (message instanceof ArrayBuffer || message instanceof Uint8Array) {
                if (process.send)
                    process.send(message);
            }
            else {
                throw new Error(`WebWorkerTransport: Received unknown type of message, expecting Uint8Array`);
            }
        },
        close() {
            if ("exit" in process) {
                process.exit(0);
            }
            else {
                process.kill();
            }
        },
    };
    return api;
}
async function run() {
    if (!process.send) {
        throw new Error("Impossible to start application, no IPC pipe was set");
    }
    if (!inspector.url())
        inspector.open();
    const inspectorSession = new inspector.Session();
    inspectorSession.connect();
    const scene = JSON.parse((0, fs_1.readFileSync)("scene.json").toString());
    // resolve absolute path, it is necessary to resolve the sourceMaps
    const sceneJsonFile = (0, path_1.resolve)(scene.main);
    const sceneJsonContent = (0, fs_1.readFileSync)(sceneJsonFile).toString();
    console.log(`> will load file: ${sceneJsonFile}`);
    const transport = IPCTransport(process);
    const [runtime] = await (0, vm_1.runIvm)(sceneJsonContent, sceneJsonFile, transport);
    console.log("> awaiting scene to run");
    await runtime;
    console.log("> exiting2");
}
process.setUncaughtExceptionCaptureCallback(exit);
// handle kill
process.on("SIGTERM", () => exit());
// handle ctrl-c
process.on("SIGINT", () => exit());
run().catch(exit);
