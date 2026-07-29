/**
 * Minimal slice of the Billing bounded context needed by RF-01 (tenant is
 * created with a TRIAL subscription). Full Subscription/Plan domain lands
 * with EPIC-03.
 */
export interface SubscriptionRepository {
  createTrialSubscription(tenantId: string): Promise<void>
}
