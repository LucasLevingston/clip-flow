import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetSubscriptionUseCase } from "../../../../application/use-cases/billing/GetSubscriptionUseCase"
import { createGetSubscriptionHandler } from "./getSubscriptionHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("getSubscriptionHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as GetSubscriptionUseCase
    const handler = createGetSubscriptionHandler(useCase)
    const request = {} as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
