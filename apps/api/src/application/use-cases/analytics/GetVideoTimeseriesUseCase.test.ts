import { VideoNotFoundError } from "../../../domain/analytics/errors/VideoNotFoundError"
import { FakeAnalyticsQueryRepository } from "../../../test-utils/fakes/FakeAnalyticsQueryRepository"
import { GetVideoTimeseriesUseCase } from "./GetVideoTimeseriesUseCase"

describe("GetVideoTimeseriesUseCase", () => {
  it("should return the video's timeseries", async () => {
    const analyticsQueryRepository = new FakeAnalyticsQueryRepository()
    analyticsQueryRepository.seedTimeseries("video-1", [
      { collectedAt: new Date("2026-07-01"), views: 10, likes: 1, comments: 0 },
    ])
    const useCase = new GetVideoTimeseriesUseCase({ analyticsQueryRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", generatedVideoId: "video-1" })

    expect(result).toHaveLength(1)
  })

  it("should throw when the video does not exist or isn't owned by the tenant", async () => {
    const analyticsQueryRepository = new FakeAnalyticsQueryRepository()
    const useCase = new GetVideoTimeseriesUseCase({ analyticsQueryRepository })

    await expect(
      useCase.execute({ tenantId: "tenant-1", generatedVideoId: "ghost" }),
    ).rejects.toThrow(VideoNotFoundError)
  })
})
