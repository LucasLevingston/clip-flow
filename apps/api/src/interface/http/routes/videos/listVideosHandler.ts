import { listVideosQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListVideosUseCase } from "../../../../application/use-cases/videos/ListVideosUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/videos` — see docs/api/videos-api.md. */
export function createListVideosHandler(useCase: ListVideosUseCase) {
  return async function listVideosHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(listVideosQuerySchema, request.query, reply)
    if (!input) return reply

    const { page, pageSize, ...filters } = input
    const result = await useCase.execute({
      tenantId: request.auth.tenantId,
      page,
      pageSize,
      filters,
    })
    return reply.status(200).send(result)
  }
}
