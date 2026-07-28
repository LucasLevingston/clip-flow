import type { AddressInfo } from "node:net"
import { startHealthzServer } from "./startHealthzServer"

describe("startHealthzServer", () => {
  it("should respond 200 with status ok on /healthz", async () => {
    const server = startHealthzServer(0)
    const port = (server.address() as AddressInfo).port

    const response = await fetch(`http://127.0.0.1:${port}/healthz`)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ status: "ok" })
    server.close()
  })

  it("should respond 404 for any other path", async () => {
    const server = startHealthzServer(0)
    const port = (server.address() as AddressInfo).port

    const response = await fetch(`http://127.0.0.1:${port}/unknown`)

    expect(response.status).toBe(404)
    server.close()
  })
})
