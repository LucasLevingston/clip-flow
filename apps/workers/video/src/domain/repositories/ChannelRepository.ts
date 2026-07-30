export interface ChannelSnapshot {
  id: string
  thumbnailEnabled: boolean
}

export interface ChannelRepository {
  findById(channelId: string): Promise<ChannelSnapshot | null>
}
