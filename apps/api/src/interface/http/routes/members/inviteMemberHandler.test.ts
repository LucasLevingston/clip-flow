import type { FastifyReply, FastifyRequest } from "fastify"
import type { InviteMemberUseCase } from "../../../../application/use-cases/identity/InviteMemberUseCase"
import { createInviteMemberHandler } from "./inviteMemberHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("inviteMemberHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as InviteMemberUseCase
    const handler = createInviteMemberHandler(useCase)
    const request = { body: {} } as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
