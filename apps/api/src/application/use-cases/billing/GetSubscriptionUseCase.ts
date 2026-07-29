import type {
  ChannelUsage,
  PlanLimitsCalculator,
} from "../../../domain/billing/services/PlanLimitsCalculator"
import type { ChannelUsageProvider } from "../../../domain/billing/repositories/ChannelUsageProvider"
import type { PlanRepository } from "../../../domain/billing/repositories/PlanRepository"
import type { SubscriptionRepository } from "../../../domain/billing/repositories/SubscriptionRepository"
import type { SubscriptionStatus } from "../../../domain/billing/entities/Subscription"

export interface GetSubscriptionInput {
  tenantId: string
}

export interface GetSubscriptionOutput {
  plan: { id: string; name: string }
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  usage: { channels: ChannelUsage }
}

export interface GetSubscriptionUseCaseDeps {
  subscriptionRepository: SubscriptionRepository
  planRepository: PlanRepository
  channelUsageProvider: ChannelUsageProvider
  planLimitsCalculator: PlanLimitsCalculator
}

/** RF-08 — `GET /v1/subscription`. Every tenant has exactly one, created at registration. */
export class GetSubscriptionUseCase {
  constructor(private readonly deps: GetSubscriptionUseCaseDeps) {}

  async execute(input: GetSubscriptionInput): Promise<GetSubscriptionOutput> {
    const subscription = await this.deps.subscriptionRepository.findByTenantId(input.tenantId)
    if (!subscription) {
      throw new Error(`Tenant "${input.tenantId}" has no subscription`)
    }

    const plan = await this.deps.planRepository.findById(subscription.planId)
    if (!plan) {
      throw new Error(`Subscription references unknown plan "${subscription.planId}"`)
    }

    const channelCount = await this.deps.channelUsageProvider.countByTenant(input.tenantId)

    return {
      plan: { id: plan.id, name: plan.name },
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      usage: { channels: this.deps.planLimitsCalculator.calculateChannelUsage(plan, channelCount) },
    }
  }
}
