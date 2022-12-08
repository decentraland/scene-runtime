import { createFetch } from "../common/Fetch"
import { createWebSocket } from "../common/WebSocket"

export const allowListES2020: Array<keyof typeof globalThis> = [
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'Error',
  'escape',
  'eval',
  'EvalError',
  'Float32Array',
  'Float64Array',
  'Function',
  'globalThis',
  'Infinity',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'isFinite',
  'isNaN',
  'JSON',
  'Map',
  'Math',
  'NaN',
  'Number',
  'Object',
  'parseFloat',
  'parseInt',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'Reflect',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'undefined',
  'unescape',
  'URIError',
  'WeakMap',
  'WeakSet'
]

// eslint-disable-next-line @typescript-eslint/ban-types
const defer: (fn: Function) => void = (Promise.resolve().then as any).bind(Promise.resolve() as any)

export async function runWithScope(code: string, context: any) {
  const mustProxy = [
    'exports',
    'setInterval',
    'setTimeout',
    'require',
    'fetch',
    'console',
    'module',
    'process'
  ]

  const func = new Function('globalThis', `with (globalThis) {${code}}`)
  const proxy: any = new Proxy(context, {
    has(target, propKey: string | symbol): boolean {
      if (propKey === 'eval') return true
      if (propKey === 'globalThis') return true
      if (propKey === 'global') return true
      if (propKey === 'undefined') return true
      if (context[propKey]) return true
      if (allowListES2020.includes(propKey as any)) {
        return true
      }
      if (mustProxy.includes(propKey as any)) return true
      return false
    },
    get(target, propKey, receiver) {
      if (propKey === 'eval') return eval
      if (propKey === 'globalThis') return proxy
      if (propKey === 'global') return proxy
      if (propKey === 'undefined') return undefined
      if (context[propKey]) return context[propKey]
      if (allowListES2020.includes(propKey as any)) {
        return (globalThis as any)[propKey]
      }
      return undefined
    },
    // apply(target, thisArg: any, argArray: any[]): any {
    //   return Reflect.apply(target, thisArg, argArray)
    // },
    // construct(target, argArray: any[], newTarget: Function): object {
    //   return Reflect.construct(target, argArray, newTarget)
    // },
    // defineProperty(target, property: string | symbol, attributes: PropertyDescriptor): boolean {
    //   return Reflect.defineProperty(target, property, attributes)
    // },
    // deleteProperty(target, p: string | symbol): boolean {
    //   return Reflect.deleteProperty(target, p)
    // },
    // getOwnPropertyDescriptor(target, p: string | symbol): PropertyDescriptor | undefined {
    //   return Reflect.getOwnPropertyDescriptor(target, p)
    // },
    // getPrototypeOf(target): object | null {
    //   return Reflect.getPrototypeOf(target)
    // },
    // isExtensible(target): boolean {
    //   return Reflect.isExtensible(target)
    // },
    // ownKeys(target): ArrayLike<string | symbol> {
    //   return Reflect.ownKeys(target)
    // },
    // preventExtensions(target): boolean {
    //   return Reflect.preventExtensions(target)
    // },
    // set(target, p: string | symbol, newValue: any, receiver: any): boolean {
    //   return Reflect.set(target, p, newValue, receiver)
    // },
    // setPrototypeOf(target, v: object | null): boolean {
    //   return Reflect.setPrototypeOf(target, v)
    // }
  })

  return defer(() => func.call(proxy, proxy))
}

export async function customEvalSdk7(code: string, context: any, devtool: boolean) {
  const newCode = devtool ? `eval(${JSON.stringify(code)})` : code

  return runWithScope(newCode, context)
}


export function prepareSdk7SandboxContext(options: {
  canUseWebsocket: boolean
  canUseFetch: boolean
  previewMode: boolean
  log: (x: string) => void
}) {
  const originalFetch = globalThis.fetch

  const restrictedWebSocket = createWebSocket(options)
  const restrictedFetch = createFetch({ ...options, originalFetch })

    ; (globalThis as any).fetch = restrictedFetch
  globalThis.WebSocket = restrictedWebSocket

  return { WebSocket: restrictedWebSocket, fetch: restrictedFetch }
}
