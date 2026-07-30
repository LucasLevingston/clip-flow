import type { ChannelPlatforms } from "../types"

export interface ChannelSnapshot {
  id: string
  platforms: ChannelPlatforms
}

export interface ChannelRepository {
  findById(channelId: string): Promise<ChannelSnapshot | null>
}
