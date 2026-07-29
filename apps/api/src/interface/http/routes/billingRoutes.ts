import type { FastifyInstance } from "fastify"
import type { CreateCheckoutSessionUseCase } from "../../../application/use-cases/billing/CreateCheckoutSessionUseCase"
import type { ProcessStripeWebhookUseCase } from "../../../application/use-cases/billing/ProcessStripeWebhookUseCase"
import type { JwtService } from "../../../domain/identity/services/JwtService"
import { createAuthMiddleware } from "../middlewares/authMiddleware"
import { requireRole } from "../middlewares/requireRole"
import { createCheckoutSessionHandler } from "./billing/checkoutSessionHandler"
import { createStripeWebhookHandler } from "./billing/stripeWebhookHandler"

export interface BillingRoutesDeps {
  createCheckoutSessionUseCase: CreateCheckoutSessionUseCase
  processStripeWebhookUseCase: ProcessStripeWebhookUseCase
  jwtService: JwtService
}

export function registerBillingRoutes(app: FastifyInstance, deps: BillingRoutesDeps): void {
  const authMiddleware = createAuthMiddleware(deps.jwtService)
  const requireOwner = requireRole(["OWNER"])

  app.post(
    "/v1/billing/checkout-session",
    { preHandler: [authMiddleware, requireOwner] },
    createCheckoutSessionHandler(deps.createCheckoutSessionUseCase),
  )

  // Isolated encapsulation context: only this route sees raw bodies — the
  // Stripe signature check needs the exact bytes Stripe signed, not the
  // Fastify-reparsed JSON object used by every other route.
  void app.register((instance, _opts, registerDone) => {
    instance.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_request, body, parseDone) => parseDone(null, body),
    )
    instance.post(
      "/v1/billing/webhooks/stripe",
      createStripeWebhookHandler(deps.processStripeWebhookUseCase),
    )
    registerDone()
  })
}
