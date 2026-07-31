import type { Channel } from "../../domain/channel-management/entities/Channel"
import type {
  ChannelListFilter,
  ChannelListResult,
  ChannelRepository,
} from "../../domain/channel-management/repositories/ChannelRepository"

export class InMemoryChannelRepository implements ChannelRepository {
  private readonly channelsById = new Map<string, Channel>()
  private readonly deletedIds = new Set<string>()

  findById(id: string, tenantId: string): Promise<Channel | null> {
    if (this.deletedIds.has(id)) return Promise.resolve(null)
    const channel = this.channelsById.get(id)
    return Promise.resolve(channel && channel.tenantId === tenantId ? channel : null)
  }

  findPaginatedByTenant(filter: ChannelListFilter): Promise<ChannelListResult> {
    const matching = [...this.channelsById.values()]
      .filter((channel) => !this.deletedIds.has(channel.id))
      .filter((channel) => channel.tenantId === filter.tenantId)
      .filter((channel) => !filter.status || channel.status === filter.status)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    const start = (filter.page - 1) * filter.pageSize
    const items = matching.slice(start, start + filter.pageSize)

    return Promise.resolve({ items, total: matching.length })
  }

  save(channel: Channel): Promise<void> {
    this.channelsById.set(channel.id, channel)
    return Promise.resolve()
  }

  // tenantId scoping is a real Prisma-level guarantee (see ChannelPrismaRepository); callers
  // only ever reach delete() with an already-ownership-verified channel, so the fake doesn't
  // need to re-simulate that branch.
  delete(id: string, _tenantId: string): Promise<void> {
    this.deletedIds.add(id)
    return Promise.resolve()
  }
}
