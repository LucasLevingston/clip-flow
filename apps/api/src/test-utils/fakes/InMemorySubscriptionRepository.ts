import type { SubscriptionRepository } from "../../domain/billing/repositories/SubscriptionRepository"

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  readonly trialTenantIds = new Set<string>()

  createTrialSubscription(tenantId: string): Promise<void> {
    this.trialTenantIds.add(tenantId)
    return Promise.resolve()
  }
}
