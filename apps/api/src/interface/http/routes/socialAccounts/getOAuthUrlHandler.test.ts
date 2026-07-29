import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetSocialAccountOAuthUrlUseCase } from "../../../../application/use-cases/channel-management/GetSocialAccountOAuthUrlUseCase"
import { createGetOAuthUrlHandler } from "./getOAuthUrlHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("getOAuthUrlHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as GetSocialAccountOAuthUrlUseCase
    const handler = createGetOAuthUrlHandler(useCase)
    const request = { params: { channelId: "channel-1", platform: "youtube" } } as FastifyRequest<{
      Params: { channelId: string; platform: string }
    }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
