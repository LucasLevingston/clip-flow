import type { FastifyReply, FastifyRequest } from "fastify"
import type { IngestSourceVideoUseCase } from "../../../../application/use-cases/catalog/IngestSourceVideoUseCase"
import { createIngestSourceVideoHandler } from "./ingestSourceVideoHandler"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status }
}

describe("ingestSourceVideoHandler", () => {
  it("should reject when authMiddleware did not populate request.auth", async () => {
    const execute = jest.fn()
    const useCase = { execute } as unknown as IngestSourceVideoUseCase
    const handler = createIngestSourceVideoHandler(useCase)
    const request = { body: {} } as FastifyRequest
    const { reply, status } = createReplyStub()

    await handler(request, reply)

    expect(status).toHaveBeenCalledWith(401)
    expect(execute).not.toHaveBeenCalled()
  })
})
