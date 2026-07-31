export interface ChannelInsightsSnapshot {
  bestPublishHours: unknown
  topTitlePatterns: unknown
  topHashtags: unknown
  avgOptimalDurationMs: number
  computedAt: Date
}

/** Returns null for a channel with no computed insights yet — that is the normal case, not an error. */
export interface ChannelInsightsRepository {
  findByChannelId(channelId: string): Promise<ChannelInsightsSnapshot | null>
}
