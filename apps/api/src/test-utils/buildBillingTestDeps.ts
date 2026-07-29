import { ChangePlanUseCase } from "../application/use-cases/billing/ChangePlanUseCase"
import { CreateCheckoutSessionUseCase } from "../application/use-cases/billing/CreateCheckoutSessionUseCase"
import { GetPlansUseCase } from "../application/use-cases/billing/GetPlansUseCase"
import { GetSubscriptionUseCase } from "../application/use-cases/billing/GetSubscriptionUseCase"
import { ProcessStripeWebhookUseCase } from "../application/use-cases/billing/ProcessStripeWebhookUseCase"
import type { SubscriptionRepository } from "../domain/billing/repositories/SubscriptionRepository"
import { PlanLimitsCalculator } from "../domain/billing/services/PlanLimitsCalculator"
import type { UserRepository } from "../domain/identity/repositories/UserRepository"
import type { JwtService } from "../domain/identity/services/JwtService"
import { FakeChannelUsageProvider } from "./fakes/FakeChannelUsageProvider"
import { FakeCheckoutSessionProvider } from "./fakes/FakeCheckoutSessionProvider"
import { FakeStripeWebhookVerifier } from "./fakes/FakeStripeWebhookVerifier"
import { InMemoryPlanRepository } from "./fakes/InMemoryPlanRepository"
import { seedBillingPlans } from "./seedBillingPlans"

export interface BuildBillingTestDepsInput {
  subscriptionRepository: SubscriptionRepository
  userRepository: UserRepository
  jwtService: JwtService
}

/** Wires the Billing bounded context's use cases + fakes for `buildTestServer`. */
export function buildBillingTestDeps(input: BuildBillingTestDepsInput) {
  const planRepository = new InMemoryPlanRepository()
  const channelUsageProvider = new FakeChannelUsageProvider()
  const checkoutSessionProvider = new FakeCheckoutSessionProvider()
  const webhookVerifier = new FakeStripeWebhookVerifier()
  const planLimitsCalculator = new PlanLimitsCalculator()
  seedBillingPlans(planRepository)

  const billingDeps = {
    planRepository,
    subscriptionRepository: input.subscriptionRepository,
    channelUsageProvider,
    planLimitsCalculator,
  }

  return {
    planRepository,
    channelUsageProvider,
    checkoutSessionProvider,
    serverDeps: {
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
          checkoutSessionProvider,
        }),
        processStripeWebhookUseCase: new ProcessStripeWebhookUseCase({
          webhookVerifier,
          subscriptionRepository: input.subscriptionRepository,
        }),
        jwtService: input.jwtService,
      },
    },
  }
}
