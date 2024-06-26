/// <reference types="@dcl/posix" />

import { createFetch } from '../../common/Fetch'
import { createWebSocket } from '../../common/WebSocket'

const allowListES5: Array<keyof typeof globalThis> = [
  'eval',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'unescape',
  'Object',
  'Function',
  'String',
  'Boolean',
  'Number',
  'Math',
  'Date',
  'RegExp',
  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
  'JSON',
  'Array',
  'Promise',
  'NaN',
  'Infinity',
]

// eslint-disable-next-line @typescript-eslint/ban-types
const defer: (fn: Function) => void = (Promise.resolve().then as any).bind(Promise.resolve() as any)

export async function customEval(code: string, context: any, previewMode: boolean) {
  const sandbox: any = {}

  const resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000)
  sandbox[resultKey] = {}

  Object.keys(context).forEach(function (key) {
    sandbox[key] = context[key]
  })

  sandbox.window = sandbox
  sandbox.self = sandbox

  return defer(() => new Function('code', previewMode ? `with (this) { ${code} }` : `with (this) { eval(${JSON.stringify(code)}) }`).call(sandbox, code))
}

function getES5Context(base: Record<string, any>) {
  // globalThis shouldn't crash here, as allowListES5 is an array of `keyof typeof globalThis`
  allowListES5.forEach(($) => (base[$] = (globalThis as any)[$]))

  return base
}

export function prepareSandboxContext(options: {
  dcl: DecentralandInterface | undefined
  canUseWebsocket: boolean
  canUseFetch: boolean
  previewMode: boolean
  log: (x: string) => void
}) {
  const originalFetch = globalThis.fetch

  const restrictedWebSocket = createWebSocket(options)
  const restrictedFetch = createFetch({ ...options, originalFetch })

  ;(globalThis as any).fetch = restrictedFetch
  globalThis.WebSocket = restrictedWebSocket

  const env = { dcl: options.dcl, WebSocket: restrictedWebSocket, fetch: restrictedFetch }

  return getES5Context(env)
}
