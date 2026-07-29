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
  findById(id: string): Promise<Channel | null>
  findPaginatedByTenant(filter: ChannelListFilter): Promise<ChannelListResult>
  save(channel: Channel): Promise<void>
  /** Soft delete — sets `deletedAt`, preserves referenced GeneratedVideo history. */
  delete(id: string): Promise<void>
}
