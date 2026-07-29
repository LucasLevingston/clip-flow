import type { SubscriptionStatus } from "../types"

export interface SubscriptionReadRepository {
  findStatusByTenantId(tenantId: string): Promise<SubscriptionStatus | null>
}
