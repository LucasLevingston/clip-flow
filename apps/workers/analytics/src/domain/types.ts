export type SocialAccountPlatform = "YOUTUBE" | "TIKTOK"

export interface NormalizedMetrics {
  views: number
  likes: number
  comments: number
  shares: number
  retentionRate: number
  ctr: number
}

export interface ChannelPerformanceRecord {
  publishedAt: Date
  title: string
  hashtags: string[]
  durationMs: number
  views: number
  likes: number
  comments: number
  shares: number
}

export interface ChannelInsightsResult {
  bestPublishHours: number[]
  topTitlePatterns: string[]
  topHashtags: string[]
  avgOptimalDurationMs: number
}
