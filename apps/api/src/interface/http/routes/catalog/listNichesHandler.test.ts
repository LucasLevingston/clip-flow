import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListNichesUseCase } from "../../../../application/use-cases/catalog/ListNichesUseCase"
import { createListNichesHandler } from "./listNichesHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("listNichesHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as ListNichesUseCase
    const handler = createListNichesHandler(useCase)
    const request = { query: {} } as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
