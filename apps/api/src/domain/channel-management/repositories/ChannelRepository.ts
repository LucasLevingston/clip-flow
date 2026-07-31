import type { Channel, ChannelStatus } from "../entities/Channel"

export interface ChannelListFilter {
  tenantId: string
  page: number
  pageSize: number
  status?: ChannelStatus | undefined
}

export interface ChannelListResult {
  items: Channel[]
  total: number
}

export interface ChannelRepository {
  /** Scoped by tenantId at the query level — never trust a bare id from a route param alone. */
  findById(id: string, tenantId: string): Promise<Channel | null>
  findPaginatedByTenant(filter: ChannelListFilter): Promise<ChannelListResult>
  save(channel: Channel): Promise<void>
  /** Soft delete — sets `deletedAt`, preserves referenced GeneratedVideo history. */
  delete(id: string, tenantId: string): Promise<void>
}
