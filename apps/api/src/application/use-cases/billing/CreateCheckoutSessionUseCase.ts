import { PlanNotFoundError } from "../../../domain/billing/errors/PlanNotFoundError"
import type {
  CheckoutSessionProvider,
  CreateCheckoutSessionOutput,
} from "../../../domain/billing/services/CheckoutSessionProvider"
import type { PlanRepository } from "../../../domain/billing/repositories/PlanRepository"
import type { UserRepository } from "../../../domain/identity/repositories/UserRepository"

export interface CreateCheckoutSessionInput {
  tenantId: string
  userId: string
  planId: string
}

export interface CreateCheckoutSessionUseCaseDeps {
  planRepository: PlanRepository
  userRepository: UserRepository
  checkoutSessionProvider: CheckoutSessionProvider
}

/** RF-08 — `POST /v1/billing/checkout-session`. Plans without a `stripePriceId` are not purchasable. */
export class CreateCheckoutSessionUseCase {
  constructor(private readonly deps: CreateCheckoutSessionUseCaseDeps) {}

  async execute(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
    const plan = await this.deps.planRepository.findById(input.planId)
    if (!plan?.stripePriceId) {
      throw new PlanNotFoundError(input.planId)
    }

    const user = await this.deps.userRepository.findById(input.userId)
    if (!user) {
      throw new Error(`User "${input.userId}" not found`)
    }

    return this.deps.checkoutSessionProvider.createCheckoutSession({
      tenantId: input.tenantId,
      customerEmail: user.email.value,
      stripePriceId: plan.stripePriceId,
    })
  }
}
