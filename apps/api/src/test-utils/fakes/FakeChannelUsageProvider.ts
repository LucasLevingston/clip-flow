import type { ChannelUsageProvider } from "../../domain/billing/repositories/ChannelUsageProvider"

export class FakeChannelUsageProvider implements ChannelUsageProvider {
  private readonly countsByTenantId = new Map<string, number>()

  setCount(tenantId: string, count: number): void {
    this.countsByTenantId.set(tenantId, count)
  }

  countByTenant(tenantId: string): Promise<number> {
    return Promise.resolve(this.countsByTenantId.get(tenantId) ?? 0)
  }
}
