import type { FastifyReply, FastifyRequest } from "fastify"
import type { ListNotificationPreferencesUseCase } from "../../../../application/use-cases/notifications/ListNotificationPreferencesUseCase"
import { sendError } from "../../sendError"

/** `GET /v1/notification-preferences` — see docs/api/notifications-api.md. */
export function createListNotificationPreferencesHandler(
  useCase: ListNotificationPreferencesUseCase,
) {
  return async function listNotificationPreferencesHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const result = await useCase.execute({ userId: request.auth.sub })
    return reply.status(200).send(result)
  }
}
