import { DowngradeBlockedByUsageError } from "../../../domain/billing/errors/DowngradeBlockedByUsageError"
import { PlanNotFoundError } from "../../../domain/billing/errors/PlanNotFoundError"
import type { ChannelUsageProvider } from "../../../domain/billing/repositories/ChannelUsageProvider"
import type { PlanRepository } from "../../../domain/billing/repositories/PlanRepository"
import type { SubscriptionRepository } from "../../../domain/billing/repositories/SubscriptionRepository"
import type { PlanLimitsCalculator } from "../../../domain/billing/services/PlanLimitsCalculator"
import type { SubscriptionStatus } from "../../../domain/billing/entities/Subscription"

export interface ChangePlanInput {
  tenantId: string
  planId: string
}

export interface ChangePlanOutput {
  plan: { id: string; name: string }
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
}

export interface ChangePlanUseCaseDeps {
  subscriptionRepository: SubscriptionRepository
  planRepository: PlanRepository
  channelUsageProvider: ChannelUsageProvider
  planLimitsCalculator: PlanLimitsCalculator
}

/** RF-08 — upgrades are never blocked; downgrades that would exceed the new plan's limits are. */
export class ChangePlanUseCase {
  constructor(private readonly deps: ChangePlanUseCaseDeps) {}

  async execute(input: ChangePlanInput): Promise<ChangePlanOutput> {
    const newPlan = await this.deps.planRepository.findById(input.planId)
    if (!newPlan) {
      throw new PlanNotFoundError(input.planId)
    }

    const subscription = await this.deps.subscriptionRepository.findByTenantId(input.tenantId)
    if (!subscription) {
      throw new Error(`Tenant "${input.tenantId}" has no subscription`)
    }

    const channelCount = await this.deps.channelUsageProvider.countByTenant(input.tenantId)
    if (this.deps.planLimitsCalculator.exceedsChannelLimit(newPlan, channelCount)) {
      throw new DowngradeBlockedByUsageError(["channels"])
    }

    const updated = subscription.withPlan(newPlan.id)
    await this.deps.subscriptionRepository.save(updated)

    return {
      plan: { id: newPlan.id, name: newPlan.name },
      status: updated.status,
      currentPeriodEnd: updated.currentPeriodEnd,
    }
  }
}
