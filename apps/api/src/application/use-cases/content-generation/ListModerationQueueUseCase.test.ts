import { InMemoryGeneratedVideoRepository } from "../../../test-utils/fakes/InMemoryGeneratedVideoRepository"
import { ListModerationQueueUseCase } from "./ListModerationQueueUseCase"

describe("ListModerationQueueUseCase", () => {
  it("should list only videos pending moderation, paginated", async () => {
    const generatedVideoRepository = new InMemoryGeneratedVideoRepository()
    generatedVideoRepository.seed({
      id: "flagged-1",
      channelId: "channel-1",
      status: "PENDING_MODERATION",
      flagReason: "violence",
      createdAt: new Date("2026-07-01"),
    })
    generatedVideoRepository.seed({
      id: "ready-1",
      channelId: "channel-1",
      status: "CONTENT_READY",
      flagReason: null,
      createdAt: new Date("2026-07-01"),
    })
    const useCase = new ListModerationQueueUseCase({ generatedVideoRepository })

    const result = await useCase.execute({ page: 1, pageSize: 20 })

    expect(result.data).toEqual([
      {
        id: "flagged-1",
        channelId: "channel-1",
        flagReason: "violence",
        createdAt: new Date("2026-07-01"),
      },
    ])
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1 })
  })
})
