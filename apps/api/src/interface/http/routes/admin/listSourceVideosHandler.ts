import { listSourceVideosQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListSourceVideosUseCase } from "../../../../application/use-cases/catalog/ListSourceVideosUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/admin/source-videos` — see docs/api/admin-api.md. */
export function createListSourceVideosHandler(useCase: ListSourceVideosUseCase) {
  return async function listSourceVideosHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(listSourceVideosQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute(input)
    return reply.status(200).send(result)
  }
}
