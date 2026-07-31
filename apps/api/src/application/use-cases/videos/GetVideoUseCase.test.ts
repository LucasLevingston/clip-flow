import { VideoNotFoundError } from "../../../domain/videos/errors/VideoNotFoundError"
import { FakeVideoRepository } from "../../../test-utils/fakes/FakeVideoRepository"
import { GetVideoUseCase } from "./GetVideoUseCase"

function seedVideo(videoRepository: FakeVideoRepository) {
  videoRepository.seedDetail("tenant-1", {
    id: "video-1",
    channelId: "channel-1",
    status: "PUBLISHED",
    highlight: { startMs: 0, endMs: 30_000 },
    copy: { title: "T", description: "D", hashtags: ["#a"], cta: "Segue" },
    thumbnailUrl: null,
    finalAssetUrl: "https://cdn/final.mp4",
    scheduledPublishAt: new Date("2026-07-01"),
    createdAt: new Date("2026-07-01"),
    publishRecords: [],
  })
}

describe("GetVideoUseCase", () => {
  it("should return the video detail when it belongs to the tenant", async () => {
    const videoRepository = new FakeVideoRepository()
    seedVideo(videoRepository)
    const useCase = new GetVideoUseCase({ videoRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", videoId: "video-1" })

    expect(result.id).toBe("video-1")
  })

  it("should throw when the video does not exist", async () => {
    const videoRepository = new FakeVideoRepository()
    const useCase = new GetVideoUseCase({ videoRepository })

    await expect(useCase.execute({ tenantId: "tenant-1", videoId: "ghost" })).rejects.toThrow(
      VideoNotFoundError,
    )
  })

  it("should throw when the video belongs to another tenant", async () => {
    const videoRepository = new FakeVideoRepository()
    seedVideo(videoRepository)
    const useCase = new GetVideoUseCase({ videoRepository })

    await expect(useCase.execute({ tenantId: "someone-else", videoId: "video-1" })).rejects.toThrow(
      VideoNotFoundError,
    )
  })
})
