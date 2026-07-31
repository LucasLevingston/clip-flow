import type { AnalyticsSummary } from "../repositories/AnalyticsQueryRepository"

export interface PublishRecordMetrics {
  generatedVideoId: string
  platform: "YOUTUBE" | "TIKTOK"
  views: number
  likes: number
  comments: number
  shares: number
}

const TOP_VIDEOS_LIMIT = 5

/**
 * Pure — no I/O. `subscribersGrowth` has no backing data model yet (no subscriber-count
 * tracking anywhere in the schema) — always 0 until that's added; disclosed gap.
 */
export function aggregateAnalyticsSummary(records: PublishRecordMetrics[]): AnalyticsSummary {
  const byPlatform = { YOUTUBE: { videos: 0, views: 0 }, TIKTOK: { videos: 0, views: 0 } }
  const viewsByVideoId = new Map<string, number>()
  let totalViews = 0
  let totalLikes = 0
  let totalComments = 0
  let totalShares = 0

  for (const record of records) {
    totalViews += record.views
    totalLikes += record.likes
    totalComments += record.comments
    totalShares += record.shares
    byPlatform[record.platform].videos += 1
    byPlatform[record.platform].views += record.views
    viewsByVideoId.set(
      record.generatedVideoId,
      (viewsByVideoId.get(record.generatedVideoId) ?? 0) + record.views,
    )
  }

  const topVideos = [...viewsByVideoId.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_VIDEOS_LIMIT)
    .map(([generatedVideoId, views]) => ({ generatedVideoId, views }))

  return {
    totalVideos: viewsByVideoId.size,
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    subscribersGrowth: 0,
    byPlatform,
    topVideos,
  }
}
