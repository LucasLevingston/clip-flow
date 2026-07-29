import type { ChannelUsageProvider } from "../../domain/billing/repositories/ChannelUsageProvider"

interface ChannelCounter {
  findPaginatedByTenant(filter: {
    tenantId: string
    page: number
    pageSize: number
  }): Promise<{ total: number }>
}

/** Explicit `setCount` overrides win — lets billing-only tests simulate usage without real channels. */
export class FakeChannelUsageProvider implements ChannelUsageProvider {
  private readonly overridesByTenantId = new Map<string, number>()

  constructor(private readonly channelRepository?: ChannelCounter) {}

  setCount(tenantId: string, count: number): void {
    this.overridesByTenantId.set(tenantId, count)
  }

  async countByTenant(tenantId: string): Promise<number> {
    const override = this.overridesByTenantId.get(tenantId)
    if (override !== undefined) return override
    if (!this.channelRepository) return 0

    const { total } = await this.channelRepository.findPaginatedByTenant({
      tenantId,
      page: 1,
      pageSize: 1,
    })
    return total
  }
}
