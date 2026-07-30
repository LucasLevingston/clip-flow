import type { FastifyReply, FastifyRequest } from "fastify"
import type { MarkNotificationReadUseCase } from "../../../../application/use-cases/notifications/MarkNotificationReadUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

type Params = { id: string }

/** `PATCH /v1/notifications/:id/read` — see docs/api/notifications-api.md. */
export function createMarkNotificationReadHandler(useCase: MarkNotificationReadUseCase) {
  return async function markNotificationReadHandler(
    request: FastifyRequest<{ Params: Params }>,
    reply: FastifyReply,
  ) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    try {
      const result = await useCase.execute({
        userId: request.auth.sub,
        notificationId: request.params.id,
      })
      return reply.status(200).send(result)
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
