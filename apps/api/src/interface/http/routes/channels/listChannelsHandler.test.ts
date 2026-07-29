import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListChannelsUseCase } from "../../../../application/use-cases/channel-management/ListChannelsUseCase"
import { createListChannelsHandler } from "./listChannelsHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("listChannelsHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ListChannelsUseCase
    const handler = createListChannelsHandler(useCase)
    const request = { query: {} } as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
