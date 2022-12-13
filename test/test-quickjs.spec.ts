import fs from 'fs-extra'
import path from 'path'
import { evaluateAndCountOpCodes, evaluateWorker } from "./get-es2020-context"

import { createRpcServer } from '@dcl/rpc/dist/server'

describe('quickjs opcode counter test', () => {
  it('basic example', async () => {

    const result = await evaluateAndCountOpCodes(`
    function some() {
      return 123
    }
    let a = 0;
    for (let i=0; i< 32000; i++) {
      a += i
    }
    for (let i = 0; i < 1000; i++) {
      some('an argument')
    }
    log('some')
    `)

    if (result.opcodes) {
      const res = result.opcodes.reduce((prev, cur) => ({ ...prev, [cur.opcode]: Number(cur.count) }), {})
      console.log(res)
    }
  })

  it.only('basic example', async () => {
    // const content = fs.readFileSync(path.resolve(__dirname, 'integration', 'index-sdk-7.0.5.js')).toString()
    const runtime = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'sdk7-webworker.dev.js')).toString()
    const result = await evaluateWorker(
      `const global = globalThis; const self = globalThis; ${runtime}`
    )

    const rpcServer = createRpcServer({})
    rpcServer.setHandler(async (port, transport, ctx) => {
      console.log({ port, transport, ctx })


    })
    rpcServer.attachTransport(result.rpc.server, {})

    // while (true) {
    //   // result.QuickJS.getFFI().QTS_ExecutePendingJob()
    //   await new Promise(resolve => setTimeout(resolve, 10))
    // }


    const opcodes = result.QuickJS.getOpcodeInfo().getOpcodesCount()
    if (opcodes) {
      const detail = opcodes.reduce((prev, cur) => ({ ...prev, [cur.opcode]: Number(cur.count) }), {})
      const totalop = opcodes.reduce((prev, cur) => prev + cur.count, 0n)

      console.log({ detail, totalop })
    }

  })
})
