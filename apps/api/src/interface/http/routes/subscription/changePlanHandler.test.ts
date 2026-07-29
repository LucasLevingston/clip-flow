import type { FastifyReply, FastifyRequest } from "fastify"
import type { ChangePlanUseCase } from "../../../../application/use-cases/billing/ChangePlanUseCase"
import { createChangePlanHandler } from "./changePlanHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("changePlanHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ChangePlanUseCase
    const handler = createChangePlanHandler(useCase)
    const request = { body: {} } as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
