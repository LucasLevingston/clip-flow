import { FakeVideoRepository } from "../../../test-utils/fakes/FakeVideoRepository"
import { ExportVideosUseCase } from "./ExportVideosUseCase"

describe("ExportVideosUseCase", () => {
  it("should build a CSV from the filtered export rows", async () => {
    const videoRepository = new FakeVideoRepository()
    videoRepository.exportRows = [
      {
        id: "video-1",
        channel: "Canal",
        status: "PUBLISHED",
        platform: "YOUTUBE",
        publishedAt: new Date("2026-07-01T00:00:00.000Z"),
        views: 10,
        likes: 1,
        comments: 0,
      },
    ]
    const useCase = new ExportVideosUseCase({ videoRepository })

    const csv = await useCase.execute({ tenantId: "tenant-1", filters: {} })

    expect(csv).toContain("id,channel,status,platform,publishedAt,views,likes,comments")
    expect(csv).toContain("video-1,Canal,PUBLISHED,YOUTUBE")
  })
})
