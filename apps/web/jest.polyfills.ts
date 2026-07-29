import { TextDecoder, TextEncoder } from "node:util"
import { ReadableStream, TransformStream, WritableStream } from "node:stream/web"
import { Blob, File } from "node:buffer"
import { BroadcastChannel, MessageChannel, MessagePort } from "node:worker_threads"

Object.defineProperties(globalThis, {
  TextEncoder: { value: TextEncoder, configurable: true },
  TextDecoder: { value: TextDecoder, configurable: true },
  ReadableStream: { value: ReadableStream, configurable: true },
  TransformStream: { value: TransformStream, configurable: true },
  WritableStream: { value: WritableStream, configurable: true },
  Blob: { value: Blob, configurable: true },
  File: { value: File, configurable: true },
  MessageChannel: { value: MessageChannel, configurable: true },
  MessagePort: { value: MessagePort, configurable: true },
  BroadcastChannel: { value: BroadcastChannel, configurable: true },
})

// undici reads TextEncoder/TextDecoder/MessagePort off globalThis at import time, so it must
// be required (not statically imported) only after the polyfills above are installed.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const undici = require("undici") as typeof import("undici")
const { fetch, FormData, Headers, Request, Response } = undici

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true, configurable: true },
  Headers: { value: Headers, writable: true, configurable: true },
  FormData: { value: FormData, writable: true, configurable: true },
  Request: { value: Request, writable: true, configurable: true },
  Response: { value: Response, writable: true, configurable: true },
})
