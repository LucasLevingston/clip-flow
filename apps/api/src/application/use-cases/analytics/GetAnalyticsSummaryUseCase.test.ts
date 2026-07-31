import { FakeAnalyticsQueryRepository } from "../../../test-utils/fakes/FakeAnalyticsQueryRepository"
import { GetAnalyticsSummaryUseCase } from "./GetAnalyticsSummaryUseCase"

describe("GetAnalyticsSummaryUseCase", () => {
  it("should delegate to the repository with the given filters", async () => {
    const analyticsQueryRepository = new FakeAnalyticsQueryRepository()
    analyticsQueryRepository.summaryToReturn = {
      totalVideos: 3,
      totalViews: 100,
      totalLikes: 10,
      totalComments: 5,
      totalShares: 2,
      subscribersGrowth: 0,
      byPlatform: { YOUTUBE: { videos: 2, views: 80 }, TIKTOK: { videos: 1, views: 20 } },
      topVideos: [{ generatedVideoId: "video-1", views: 80 }],
    }
    const useCase = new GetAnalyticsSummaryUseCase({ analyticsQueryRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(result.totalVideos).toBe(3)
    expect(analyticsQueryRepository.lastSummaryFilters).toEqual({
      tenantId: "tenant-1",
      channelId: "channel-1",
    })
  })
})
