import { ChangePlanUseCase } from "../../application/use-cases/billing/ChangePlanUseCase"
import { CreateCheckoutSessionUseCase } from "../../application/use-cases/billing/CreateCheckoutSessionUseCase"
import { GetPlansUseCase } from "../../application/use-cases/billing/GetPlansUseCase"
import { GetSubscriptionUseCase } from "../../application/use-cases/billing/GetSubscriptionUseCase"
import { ProcessStripeWebhookUseCase } from "../../application/use-cases/billing/ProcessStripeWebhookUseCase"
import type { SubscriptionRepository } from "../../domain/billing/repositories/SubscriptionRepository"
import { PlanLimitsCalculator } from "../../domain/billing/services/PlanLimitsCalculator"
import type { UserRepository } from "../../domain/identity/repositories/UserRepository"
import type { JwtService } from "../../domain/identity/services/JwtService"
import { PlanPrismaRepository } from "../repositories/PlanPrismaRepository"
import { PrismaChannelUsageProvider } from "../repositories/PrismaChannelUsageProvider"
import { StripeCheckoutSessionAdapter } from "./StripeCheckoutSessionAdapter"
import { StripeWebhookVerifierAdapter } from "./StripeWebhookVerifierAdapter"

export interface CreateBillingDepsInput {
  subscriptionRepository: SubscriptionRepository
  userRepository: UserRepository
  jwtService: JwtService
}

const WEB_APP_URL = process.env.WEB_APP_URL ?? "http://localhost:3000"

/** Composition root helper — wires the real Stripe-backed Billing bounded context. */
export function createBillingDeps(input: CreateBillingDepsInput) {
  const planRepository = new PlanPrismaRepository()
  const billingDeps = {
    planRepository,
    subscriptionRepository: input.subscriptionRepository,
    channelUsageProvider: new PrismaChannelUsageProvider(),
    planLimitsCalculator: new PlanLimitsCalculator(),
  }

  return {
    planRepository,
    channelUsageProvider: billingDeps.channelUsageProvider,
    subscription: {
      getPlansUseCase: new GetPlansUseCase(billingDeps),
      getSubscriptionUseCase: new GetSubscriptionUseCase(billingDeps),
      changePlanUseCase: new ChangePlanUseCase(billingDeps),
      jwtService: input.jwtService,
    },
    billing: {
      createCheckoutSessionUseCase: new CreateCheckoutSessionUseCase({
        planRepository,
        userRepository: input.userRepository,
        checkoutSessionProvider: new StripeCheckoutSessionAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY ?? "",
          successUrl: `${WEB_APP_URL}/billing/success`,
          cancelUrl: `${WEB_APP_URL}/billing/canceled`,
        }),
      }),
      processStripeWebhookUseCase: new ProcessStripeWebhookUseCase({
        webhookVerifier: new StripeWebhookVerifierAdapter(process.env.STRIPE_WEBHOOK_SECRET ?? ""),
        subscriptionRepository: input.subscriptionRepository,
      }),
      jwtService: input.jwtService,
    },
  }
}
