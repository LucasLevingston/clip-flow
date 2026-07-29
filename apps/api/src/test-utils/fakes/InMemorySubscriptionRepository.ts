import { Subscription } from "../../domain/billing/entities/Subscription"
import type { SubscriptionRepository } from "../../domain/billing/repositories/SubscriptionRepository"

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  readonly trialTenantIds = new Set<string>()
  private readonly subscriptionsByTenantId = new Map<string, Subscription>()

  createTrialSubscription(tenantId: string): Promise<void> {
    this.trialTenantIds.add(tenantId)
    this.subscriptionsByTenantId.set(
      tenantId,
      Subscription.create({
        id: `subscription-${tenantId}`,
        tenantId,
        planId: "trial-plan",
        status: "TRIAL",
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
      }),
    )
    return Promise.resolve()
  }

  findByTenantId(tenantId: string): Promise<Subscription | null> {
    return Promise.resolve(this.subscriptionsByTenantId.get(tenantId) ?? null)
  }

  findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    for (const subscription of this.subscriptionsByTenantId.values()) {
      if (subscription.stripeCustomerId === stripeCustomerId) {
        return Promise.resolve(subscription)
      }
    }
    return Promise.resolve(null)
  }

  save(subscription: Subscription): Promise<void> {
    this.subscriptionsByTenantId.set(subscription.tenantId, subscription)
    return Promise.resolve()
  }
}
