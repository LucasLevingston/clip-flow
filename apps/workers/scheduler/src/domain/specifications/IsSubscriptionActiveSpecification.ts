import type { SubscriptionStatus } from "../types"

/** Pre-condition 1/4 — see docs/architecture/scheduler-flow.md. TRIAL counts as usable, PAST_DUE/CANCELED do not. */
export class IsSubscriptionActiveSpecification {
  isSatisfiedBy(status: SubscriptionStatus): boolean {
    return status === "ACTIVE" || status === "TRIAL"
  }
}
