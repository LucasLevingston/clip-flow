import type { FastifyReply, FastifyRequest } from "fastify"
import type { ReviewSourceVideoUseCase } from "../../../../application/use-cases/catalog/ReviewSourceVideoUseCase"
import { createReviewSourceVideoHandler } from "./reviewSourceVideoHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("reviewSourceVideoHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ReviewSourceVideoUseCase
    const handler = createReviewSourceVideoHandler(useCase)
    const request = {
      params: { id: "source-video-1" },
      body: {},
    } as FastifyRequest<{ Params: { id: string } }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
