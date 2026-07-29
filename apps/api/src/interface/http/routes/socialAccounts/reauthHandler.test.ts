import type { FastifyReply, FastifyRequest } from "fastify"
import type { ReauthSocialAccountUseCase } from "../../../../application/use-cases/channel-management/ReauthSocialAccountUseCase"
import { createReauthHandler } from "./reauthHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("reauthHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ReauthSocialAccountUseCase
    const handler = createReauthHandler(useCase)
    const request = {
      params: { channelId: "channel-1", id: "account-1" },
      body: {},
    } as FastifyRequest<{ Params: { channelId: string; id: string } }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
