export interface ChannelSnapshot {
  id: string
  nicheId: string
  language: string
  promptOverride: string | null
}

export interface ChannelRepository {
  findById(channelId: string): Promise<ChannelSnapshot | null>
}
