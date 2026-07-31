export interface AnalyticsSummaryFilters {
  tenantId: string
  channelId?: string | undefined
  from?: Date | undefined
  to?: Date | undefined
}

export interface PlatformBreakdown {
  videos: number
  views: number
}

export interface TopVideo {
  generatedVideoId: string
  views: number
}

export interface AnalyticsSummary {
  totalVideos: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  subscribersGrowth: number
  byPlatform: { YOUTUBE: PlatformBreakdown; TIKTOK: PlatformBreakdown }
  topVideos: TopVideo[]
}

export interface TimeseriesPoint {
  collectedAt: Date
  views: number
  likes: number
  comments: number
}

export interface AnalyticsQueryRepository {
  getSummary(filters: AnalyticsSummaryFilters): Promise<AnalyticsSummary>
  /** Returns null when the video doesn't exist or doesn't belong to the tenant — signals 404. */
  getVideoTimeseries(tenantId: string, generatedVideoId: string): Promise<TimeseriesPoint[] | null>
}
