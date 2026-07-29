import type { FastifyReply, FastifyRequest } from "fastify"
import type { ChangeChannelStatusUseCase } from "../../../../application/use-cases/channel-management/ChangeChannelStatusUseCase"
import { createChangeChannelStatusHandler } from "./changeChannelStatusHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("changeChannelStatusHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ChangeChannelStatusUseCase
    const handler = createChangeChannelStatusHandler(useCase)
    const request = { params: { channelId: "channel-1" }, body: {} } as FastifyRequest<{
      Params: { channelId: string }
    }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
