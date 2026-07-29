import type { FastifyReply, FastifyRequest } from "fastify"
import { requireRole } from "./requireRole"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("requireRole", () => {
  it("should call done() when the caller's role is allowed", () => {
    const handler = requireRole(["OWNER", "ADMIN"])
    const request = { auth: { role: "ADMIN" } } as FastifyRequest
    const { reply, status } = createReplyStub()
    const done = jest.fn()

    handler(request, reply, done)

    expect(done).toHaveBeenCalled()
    expect(status).not.toHaveBeenCalled()
  })

  it("should reject with 403 when the caller's role is not allowed", () => {
    const handler = requireRole(["OWNER", "ADMIN"])
    const request = { auth: { role: "MEMBER" } } as FastifyRequest
    const { reply, status } = createReplyStub()
    const done = jest.fn()

    handler(request, reply, done)

    expect(status).toHaveBeenCalledWith(403)
    expect(done).not.toHaveBeenCalled()
  })

  it("should reject with 403 when request.auth was never populated", () => {
    const handler = requireRole(["OWNER", "ADMIN"])
    const request = {} as FastifyRequest
    const { reply, status } = createReplyStub()
    const done = jest.fn()

    handler(request, reply, done)

    expect(status).toHaveBeenCalledWith(403)
    expect(done).not.toHaveBeenCalled()
  })
})
