import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetNicheUseCase } from "../../../../application/use-cases/catalog/GetNicheUseCase"
import { createGetNicheHandler } from "./getNicheHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("getNicheHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as GetNicheUseCase
    const handler = createGetNicheHandler(useCase)
    const request = { params: { nicheId: "niche-1" } } as FastifyRequest<{
      Params: { nicheId: string }
    }>
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
