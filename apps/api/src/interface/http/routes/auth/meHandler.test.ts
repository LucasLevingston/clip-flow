import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetCurrentUserUseCase } from "../../../../application/use-cases/identity/GetCurrentUserUseCase"
import { createMeHandler } from "./meHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("meHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as GetCurrentUserUseCase
    const handler = createMeHandler(useCase)
    const request = {} as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
