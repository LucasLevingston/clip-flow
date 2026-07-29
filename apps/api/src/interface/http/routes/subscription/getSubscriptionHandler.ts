import type { FastifyReply, FastifyRequest } from "fastify"
import type { GetSubscriptionUseCase } from "../../../../application/use-cases/billing/GetSubscriptionUseCase"
import { sendError } from "../../sendError"

/** `GET /v1/subscription` — see docs/api/subscriptions-api.md. Must run after authMiddleware + requireRole. */
export function createGetSubscriptionHandler(useCase: GetSubscriptionUseCase) {
  return async function getSubscriptionHandler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.auth) {
      return sendError(reply, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Missing authentication",
      })
    }

    const result = await useCase.execute({ tenantId: request.auth.tenantId })
    return reply.status(200).send(result)
  }
}
