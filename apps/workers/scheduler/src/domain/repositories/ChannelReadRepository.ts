import type { ChannelPlatforms, ChannelStatus } from "../types"

export interface ChannelSnapshot {
  id: string
  tenantId: string
  nicheId: string
  status: ChannelStatus
  platforms: ChannelPlatforms
  videosPerDay: number
  publishTimes: string[]
}

export interface ChannelReadRepository {
  findById(channelId: string): Promise<ChannelSnapshot | null>
}
