import type { Channel } from "../../domain/channel-management/entities/Channel"
import type {
  ChannelListFilter,
  ChannelListResult,
  ChannelRepository,
} from "../../domain/channel-management/repositories/ChannelRepository"

export class InMemoryChannelRepository implements ChannelRepository {
  private readonly channelsById = new Map<string, Channel>()
  private readonly deletedIds = new Set<string>()

  findById(id: string): Promise<Channel | null> {
    if (this.deletedIds.has(id)) return Promise.resolve(null)
    return Promise.resolve(this.channelsById.get(id) ?? null)
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

  delete(id: string): Promise<void> {
    this.deletedIds.add(id)
    return Promise.resolve()
  }
}
