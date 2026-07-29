import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetChannelUseCase } from "../../../../application/use-cases/channel-management/GetChannelUseCase"
import { createGetChannelHandler } from "./getChannelHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("getChannelHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as GetChannelUseCase
    const handler = createGetChannelHandler(useCase)
    const request = { params: { channelId: "channel-1" } } as FastifyRequest<{
      Params: { channelId: string }
    }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
