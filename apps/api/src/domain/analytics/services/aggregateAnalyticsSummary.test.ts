import { aggregateAnalyticsSummary } from "./aggregateAnalyticsSummary"
import type { PublishRecordMetrics } from "./aggregateAnalyticsSummary"

describe("aggregateAnalyticsSummary", () => {
  it("should return zeroed totals for no records", () => {
    const result = aggregateAnalyticsSummary([])

    expect(result).toEqual({
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      subscribersGrowth: 0,
      byPlatform: { YOUTUBE: { videos: 0, views: 0 }, TIKTOK: { videos: 0, views: 0 } },
      topVideos: [],
    })
  })

  it("should sum totals and break down by platform", () => {
    const records: PublishRecordMetrics[] = [
      {
        generatedVideoId: "video-1",
        platform: "YOUTUBE",
        views: 100,
        likes: 10,
        comments: 5,
        shares: 1,
      },
      {
        generatedVideoId: "video-2",
        platform: "TIKTOK",
        views: 50,
        likes: 5,
        comments: 2,
        shares: 3,
      },
    ]

    const result = aggregateAnalyticsSummary(records)

    expect(result.totalVideos).toBe(2)
    expect(result.totalViews).toBe(150)
    expect(result.byPlatform.YOUTUBE).toEqual({ videos: 1, views: 100 })
    expect(result.byPlatform.TIKTOK).toEqual({ videos: 1, views: 50 })
  })

  it("should merge multiple platform records for the same video into one view total", () => {
    const records: PublishRecordMetrics[] = [
      {
        generatedVideoId: "video-1",
        platform: "YOUTUBE",
        views: 100,
        likes: 0,
        comments: 0,
        shares: 0,
      },
      {
        generatedVideoId: "video-1",
        platform: "TIKTOK",
        views: 50,
        likes: 0,
        comments: 0,
        shares: 0,
      },
    ]

    const result = aggregateAnalyticsSummary(records)

    expect(result.totalVideos).toBe(1)
    expect(result.topVideos).toEqual([{ generatedVideoId: "video-1", views: 150 }])
  })

  it("should rank topVideos by views, capped at 5", () => {
    const records: PublishRecordMetrics[] = Array.from({ length: 6 }, (_, i) => ({
      generatedVideoId: `video-${i}`,
      platform: "YOUTUBE" as const,
      views: i * 10,
      likes: 0,
      comments: 0,
      shares: 0,
    }))

    const result = aggregateAnalyticsSummary(records)

    expect(result.topVideos).toHaveLength(5)
    expect(result.topVideos[0]).toEqual({ generatedVideoId: "video-5", views: 50 })
  })
})
