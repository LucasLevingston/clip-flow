import type { FastifyReply, FastifyRequest } from "fastify"
import type { ConnectSocialAccountUseCase } from "../../../../application/use-cases/channel-management/ConnectSocialAccountUseCase"
import { createOAuthCallbackHandler } from "./oauthCallbackHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("oauthCallbackHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ConnectSocialAccountUseCase
    const handler = createOAuthCallbackHandler(useCase)
    const request = {
      params: { channelId: "channel-1", platform: "youtube" },
      body: {},
    } as FastifyRequest<{ Params: { channelId: string; platform: string } }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
