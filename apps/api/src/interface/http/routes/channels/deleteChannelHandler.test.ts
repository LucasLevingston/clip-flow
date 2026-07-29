import type { FastifyReply, FastifyRequest } from "fastify"
import type { DeleteChannelUseCase } from "../../../../application/use-cases/channel-management/DeleteChannelUseCase"
import { createDeleteChannelHandler } from "./deleteChannelHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("deleteChannelHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as DeleteChannelUseCase
    const handler = createDeleteChannelHandler(useCase)
    const request = { params: { channelId: "channel-1" } } as FastifyRequest<{
      Params: { channelId: string }
    }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
