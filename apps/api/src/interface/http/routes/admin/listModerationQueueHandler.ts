import { moderationQueueQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListModerationQueueUseCase } from "../../../../application/use-cases/content-generation/ListModerationQueueUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/admin/moderation-queue` — see docs/api/admin-api.md. */
export function createListModerationQueueHandler(useCase: ListModerationQueueUseCase) {
  return async function listModerationQueueHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(moderationQueueQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute(input)
    return reply.status(200).send(result)
  }
}
