
import { getQuickJS, Lifetime, QuickJSRuntime } from "@dcl/quickjs-emscripten"
import future from 'fp-future'
import { fetch } from "undici"

async function evaluate(code: string) {
  const QuickJS = await getQuickJS()
  const vm = QuickJS.newContext()
  const fut = future<any[]>()

  const fn = vm.newFunction("log", (...args) => {
    fut.resolve(args.map(vm.dump))
  })
  vm.setProp(vm.global, "log", fn)

  const result = vm.evalCode(code)
  if (result.error) {
    fut.reject(vm.dump(result.error))
    result.error.dispose()
  } else {
    result.value.dispose()
  }

  fn.dispose()
  vm.dispose()

  return fut
}

type EvaluateResult = {
  result: any[]
  opcodes?: { count: bigint, opcode: number }[]
}


export async function evaluateAndCountOpCodes(code: string): Promise<EvaluateResult> {
  const QuickJS = await getQuickJS()
  const vm = QuickJS.newContext()
  const fut = future<EvaluateResult>()

  QuickJS.getOpcodeInfo().resetOpcodeCounters()

  const fn = vm.newFunction("log", (...args) => {
    fut.resolve({
      result: args.map(vm.dump),
      opcodes: QuickJS.getOpcodeInfo().getOpcodesCount()
    })
  })
  vm.setProp(vm.global, "log", fn)

  const result = vm.evalCode(code)
  if (result.error) {
    fut.reject(vm.dump(result.error))
    result.error.dispose()
  } else {
    result.value.dispose()
  }

  fn.dispose()
  vm.dispose()

  return fut
}

export async function getQuickJsGlobals() {
  const [result] = await evaluate('"use math";\nlog(Object.getOwnPropertyNames(globalThis))')
  return result
}

export async function namesExistQuickJs(names: string[]) {
  const [result] = await evaluate(`"use math";\n"use strict";
    const missing = []
    const checks = ${JSON.stringify(names)}
    for (const name of checks) {
      if (!(name in globalThis)) missing.push(name)
    }
    log(missing)
  `)
  return result
}



import { JSValueConstPointer, JSValuePointer } from "@dcl/quickjs-emscripten/dist/types-ffi"
import { MemoryTransport } from '@dcl/rpc/dist/transports/Memory'

export async function evaluateWorker(code: string) {
  const QuickJS = await getQuickJS()
  const vm = QuickJS.newContext()

  QuickJS.getOpcodeInfo().resetOpcodeCounters()

  const { client, server } = MemoryTransport()
  const messageCallbacks: (Lifetime<JSValueConstPointer, JSValueConstPointer, QuickJSRuntime> | Lifetime<JSValuePointer, JSValuePointer, QuickJSRuntime>)[] = []
  const errorCallbacks: (Lifetime<JSValueConstPointer, JSValueConstPointer, QuickJSRuntime> | Lifetime<JSValuePointer, JSValuePointer, QuickJSRuntime>)[] = []
  client.on('message', (event: Uint8Array) => {
    const res = vm.evalCode(`new Uint8Array([${event.join(',')}])`)
    if (res.error) return

    for (const cb of messageCallbacks) {
      vm.callFunction(cb, vm.undefined, res.value)
    }
  })
  client.on('error', (err: Error) => {
    const error = vm.newError(err.toString())
    for (const cb of errorCallbacks) {
      vm.callFunction(cb, vm.undefined, error)
    }
  })

  const postMessageFn = vm.newFunction("postMessage", (...args) => {
    // client.sendMessage()
    console.log({ method: "postMessage", args: args.map(vm.dump) })
  })

  const terminateFn = vm.newFunction("terminate", (...args) => {
    console.log({ method: "terminate", args: args.map(vm.dump) })
  })

  const closeFn = vm.newFunction("close", (...args) => {
    client.close()
    console.log({ method: "close", args: args.map(vm.dump) })
  })

  const addEventListenerFn = vm.newFunction("addEventListener", (...args) => {
    const eventName = vm.dump(args[0])
    const eventCb = args[1].dup()
    const options = args[2] ? vm.dump(args[2]) : undefined

    if (eventName === 'message') {
      messageCallbacks.push(eventCb)
    } else if (eventName === 'error') {
      errorCallbacks.push(eventCb)
    }

    console.log({ method: "addEventListener", eventName, eventCb: eventCb.value, options })
  })


  const fetchFn = vm.newFunction("fetch", (...args) => {
    const arg1 = vm.dump(args[0])
    const arg2 = args[1] ? vm.dump(args[1]) : undefined

    console.log({ method: "fetch", arg1, arg2 })

    const promise = vm.newPromise()
    fetch(arg1, arg2).then((result) => {
      const response = vm.newObject()
      vm.setProp(response, "json", vm.newFunction("json", () => {
        const promise = vm.newPromise()
        result.json().then((value) => {
          const res = vm.evalCode(`JSON.parse('${JSON.stringify(value)}')`)
          if (res.error) return
          promise.resolve(res.value)
        }).catch(err => {
          promise.reject(
            vm.newError(err.toString())
          )
        })

        promise.settled.then(vm.runtime.executePendingJobs)
        return promise.handle
      }))

      vm.setProp(response, "text", vm.newFunction("text", () => {
        const promise = vm.newPromise()
        result.text().then((value) => {
          promise.resolve(vm.newString(value))
        }).catch(err => {
          promise.reject(
            vm.newError(err.toString())
          )
        })

        promise.settled.then(vm.runtime.executePendingJobs)
        return promise.handle
      }))

      const headers = vm.newArray()
      {
        let i = 0
        for (const [key, value] of result.headers) {
          const arrayValue = vm.newArray()
          vm.setProp(arrayValue, 0, vm.newString(key))
          vm.setProp(arrayValue, 1, vm.newString(value))
          vm.setProp(headers, i, arrayValue)
          i++
        }
      }

      vm.setProp(response, "headers", headers)
      vm.setProp(response, "ok", result.ok ? vm.true : vm.false)
      vm.setProp(response, "status", vm.newNumber(result.status))
      vm.setProp(response, "statusText", vm.newString(result.statusText))
      vm.setProp(response, "redirected", result.redirected ? vm.true : vm.false)
      promise.resolve(response)
    })

    // IMPORTANT: Once you resolve an async action inside QuickJS,
    // call runtime.executePendingJobs() to run any code that was
    // waiting on the promise or callback.
    promise.settled.then(vm.runtime.executePendingJobs)

    return promise.handle
  })


  vm.setProp(vm.global, "addEventListener", addEventListenerFn)
  vm.setProp(vm.global, "close", closeFn)
  vm.setProp(vm.global, "postMessage", postMessageFn)
  vm.setProp(vm.global, "terminate", terminateFn)
  vm.setProp(vm.global, "fetch", fetchFn)

  const result = vm.evalCode(code)
  if (result.error) {
    const err = vm.dump(result.error)
    result.error.dispose()
    throw err
  }

  return {
    postMessage: postMessageFn,
    terminate: terminateFn,
    close: closeFn,
    addEventListener: addEventListenerFn,
    QuickJS,
    result: result.value,
    rpc: { server, client }
  }
}