import type { FastifyReply, FastifyRequest } from "fastify"
import { requirePlatformAdmin } from "./requirePlatformAdmin"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("requirePlatformAdmin", () => {
  it("should call done() when the caller is a platform admin", () => {
    const request = { auth: { isPlatformAdmin: true } } as FastifyRequest
    const { reply, status } = createReplyStub()
    const done = jest.fn()

    requirePlatformAdmin(request, reply, done)

    expect(done).toHaveBeenCalled()
    expect(status).not.toHaveBeenCalled()
  })

  it("should reject with 403 when the caller is not a platform admin", () => {
    const request = { auth: { isPlatformAdmin: false } } as FastifyRequest
    const { reply, status } = createReplyStub()
    const done = jest.fn()

    requirePlatformAdmin(request, reply, done)

    expect(status).toHaveBeenCalledWith(403)
    expect(done).not.toHaveBeenCalled()
  })

  it("should reject with 403 when request.auth was never populated", () => {
    const request = {} as FastifyRequest
    const { reply, status } = createReplyStub()
    const done = jest.fn()

    requirePlatformAdmin(request, reply, done)

    expect(status).toHaveBeenCalledWith(403)
    expect(done).not.toHaveBeenCalled()
  })
})
