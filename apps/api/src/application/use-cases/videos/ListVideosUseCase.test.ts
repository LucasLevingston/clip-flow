import { FakeVideoRepository } from "../../../test-utils/fakes/FakeVideoRepository"
import { ListVideosUseCase } from "./ListVideosUseCase"

describe("ListVideosUseCase", () => {
  it("should paginate the tenant's videos", async () => {
    const videoRepository = new FakeVideoRepository()
    videoRepository.seedSummary({
      id: "video-1",
      channelId: "channel-1",
      status: "PUBLISHED",
      sourceVideoId: "source-1",
      thumbnailUrl: null,
      finalAssetUrl: null,
      scheduledPublishAt: new Date("2026-07-01"),
      createdAt: new Date("2026-07-01"),
      publishRecords: [],
    })
    const useCase = new ListVideosUseCase({ videoRepository })

    const result = await useCase.execute({
      tenantId: "tenant-1",
      page: 1,
      pageSize: 20,
      filters: {},
    })

    expect(result.data).toHaveLength(1)
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1 })
  })
})
