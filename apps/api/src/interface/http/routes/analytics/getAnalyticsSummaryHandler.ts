import { analyticsSummaryQuerySchema } from "@clip-flow/shared-schemas"
import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetAnalyticsSummaryUseCase } from "../../../../application/use-cases/analytics/GetAnalyticsSummaryUseCase"
import { parseOrSendValidationError } from "../../parseOrSendValidationError"
import { sendError } from "../../sendError"

/** `GET /v1/analytics/summary` — see docs/api/analytics-api.md. */
export function createGetAnalyticsSummaryHandler(useCase: GetAnalyticsSummaryUseCase) {
  return async function getAnalyticsSummaryHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const input = parseOrSendValidationError(analyticsSummaryQuerySchema, request.query, reply)
    if (!input) return reply

    const result = await useCase.execute({ tenantId: request.auth.tenantId, ...input })
    return reply.status(200).send(result)
  }
}
