import type { FastifyReply, FastifyRequest } from "fastify"
import type { ProcessStripeWebhookUseCase } from "../../../../application/use-cases/billing/ProcessStripeWebhookUseCase"
import { getErrorMessage } from "../../getErrorMessage"
import { mapDomainErrorToHttp } from "../../mapDomainErrorToHttp"
import { sendError } from "../../sendError"

/** `POST /v1/billing/webhooks/stripe` — see docs/api/billing-api.md. No user session; auth is the signature check. */
export function createStripeWebhookHandler(useCase: ProcessStripeWebhookUseCase) {
  return async function stripeWebhookHandler(request: FastifyRequest, reply: FastifyReply) {
    const signature = request.headers["stripe-signature"]

    try {
      await useCase.execute({
        payload: request.body as Buffer,
        signature: typeof signature === "string" ? signature : undefined,
      })
      return reply.status(200).send({ received: true })
    } catch (error) {
      const { statusCode, code } = mapDomainErrorToHttp(error)
      return sendError(reply, { statusCode, code, message: getErrorMessage(error) })
    }
  }
}
