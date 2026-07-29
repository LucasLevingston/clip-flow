import type { FastifyReply, FastifyRequest } from "fastify"
import type { AcceptInvitationUseCase } from "../../../../application/use-cases/identity/AcceptInvitationUseCase"
import { createAcceptInvitationHandler } from "./acceptInvitationHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("acceptInvitationHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as AcceptInvitationUseCase
    const handler = createAcceptInvitationHandler(useCase)
    const request = { body: {} } as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
