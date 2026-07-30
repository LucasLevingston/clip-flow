import { updateNotificationPreferencesSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { UpdateNotificationPreferencesUseCase } from "../../../../application/use-cases/notifications/UpdateNotificationPreferencesUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `PUT /v1/notification-preferences` — see docs/api/notifications-api.md. */
export function createUpdateNotificationPreferencesHandler(
  useCase: UpdateNotificationPreferencesUseCase,
) {
  return async function updateNotificationPreferencesHandler(
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

    const input = parseOrSendValidationError(
      updateNotificationPreferencesSchema,
      request.body,
      reply,
    )
    if (!input) return reply

    try {
      const result = await useCase.execute({ userId: request.auth.sub, preferences: input })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
