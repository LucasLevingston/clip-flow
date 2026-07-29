import type { Subscription } from "../entities/Subscription"

export interface SubscriptionRepository {
  /** RF-01 — tenant is created with a TRIAL subscription. */
  createTrialSubscription(tenantId: string): Promise<void>
  findByTenantId(tenantId: string): Promise<Subscription | null>
  findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null>
  save(subscription: Subscription): Promise<void>
}
