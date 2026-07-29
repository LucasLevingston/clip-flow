import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListSocialAccountsUseCase } from "../../../../application/use-cases/channel-management/ListSocialAccountsUseCase"
import { createListSocialAccountsHandler } from "./listSocialAccountsHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("listSocialAccountsHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ListSocialAccountsUseCase
    const handler = createListSocialAccountsHandler(useCase)
    const request = { params: { channelId: "channel-1" } } as FastifyRequest<{
      Params: { channelId: string }
    }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
