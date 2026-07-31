import { FakeVideoRepository } from "../../../test-utils/fakes/FakeVideoRepository"
import { GetChannelPipelineUseCase } from "./GetChannelPipelineUseCase"

describe("GetChannelPipelineUseCase", () => {
  it("should return the channel's active pipeline videos", async () => {
    const videoRepository = new FakeVideoRepository()
    videoRepository.seedSummary({
      id: "video-1",
      channelId: "channel-1",
      status: "TRANSCRIBING",
      sourceVideoId: "source-1",
      thumbnailUrl: null,
      finalAssetUrl: null,
      scheduledPublishAt: new Date("2026-07-01"),
      createdAt: new Date("2026-07-01"),
      publishRecords: [],
    })
    const useCase = new GetChannelPipelineUseCase({ videoRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe("TRANSCRIBING")
  })
})
