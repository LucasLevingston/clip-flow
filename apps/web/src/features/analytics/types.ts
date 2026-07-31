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
