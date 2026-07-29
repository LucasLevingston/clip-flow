import { changePlanSchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { ChangePlanUseCase } from "../../../../application/use-cases/billing/ChangePlanUseCase"
import { DowngradeBlockedByUsageError } from "../../../../domain/billing/errors/DowngradeBlockedByUsageError"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `POST /v1/subscription/change-plan` — see docs/api/subscriptions-api.md. Must run after authMiddleware + requireRole. */
export function createChangePlanHandler(useCase: ChangePlanUseCase) {
  return async function changePlanHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(changePlanSchema, request.body, reply)
    if (!input) return reply

    try {
      const result = await useCase.execute({
        tenantId: request.auth.tenantId,
        planId: input.planId,
      })
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof DowngradeBlockedByUsageError) {
        return sendError(reply, {
          statusCode: 422,
          code: "DOWNGRADE_BLOCKED_BY_USAGE",
          message: error.message,
          details: { exceeding: error.exceeding },
        })
      }
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
