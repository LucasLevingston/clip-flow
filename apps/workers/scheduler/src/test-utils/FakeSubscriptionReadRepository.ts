import type { SubscriptionReadRepository } from "../domain/repositories/SubscriptionReadRepository"
import type { SubscriptionStatus } from "../domain/types"

export class FakeSubscriptionReadRepository implements SubscriptionReadRepository {
  private readonly statusByTenantId = new Map<string, SubscriptionStatus>()

  seed(tenantId: string, status: SubscriptionStatus): void {
    this.statusByTenantId.set(tenantId, status)
  }

  findStatusByTenantId(tenantId: string): Promise<SubscriptionStatus | null> {
    return Promise.resolve(this.statusByTenantId.get(tenantId) ?? null)
  }
}
