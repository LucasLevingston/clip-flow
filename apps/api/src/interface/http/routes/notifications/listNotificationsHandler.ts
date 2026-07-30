import { listNotificationsQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListNotificationsUseCase } from "../../../../application/use-cases/notifications/ListNotificationsUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/notifications` — see docs/api/notifications-api.md. */
export function createListNotificationsHandler(useCase: ListNotificationsUseCase) {
  return async function listNotificationsHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(listNotificationsQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute({
      userId: request.auth.sub,
      tenantId: request.auth.tenantId,
      ...input,
    })
    return reply.status(200).send(result)
  }
}
