import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { InMemoryChannelInsightsRepository } from "../../../test-utils/fakes/InMemoryChannelInsightsRepository"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { GetChannelInsightsUseCase } from "./GetChannelInsightsUseCase"

async function seedChannel(channelRepository: InMemoryChannelRepository, tenantId: string) {
  const channel = Channel.create({
    id: "channel-1",
    tenantId,
    nicheId: "niche-1",
    name: "Canal",
    language: "pt-BR",
    promptOverride: null,
    videosPerDay: 1,
    publishTimes: [TimeOfDay.create(9, 0)],
    generationTime: TimeOfDay.create(9, 0),
    platforms: "SHORTS_ONLY",
    thumbnailEnabled: true,
  })
  await channelRepository.save(channel)
}

describe("GetChannelInsightsUseCase", () => {
  it("should return the stored insights when they exist", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await seedChannel(channelRepository, "tenant-1")
    const channelInsightsRepository = new InMemoryChannelInsightsRepository()
    channelInsightsRepository.seed("channel-1", {
      bestPublishHours: [9],
      topTitlePatterns: ["gol"],
      topHashtags: ["#futebol"],
      avgOptimalDurationMs: 30_000,
      computedAt: new Date("2026-07-30T00:00:00Z"),
    })
    const useCase = new GetChannelInsightsUseCase({ channelRepository, channelInsightsRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(result?.bestPublishHours).toEqual([9])
  })

  it("should return null when no insight has been computed yet", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await seedChannel(channelRepository, "tenant-1")
    const channelInsightsRepository = new InMemoryChannelInsightsRepository()
    const useCase = new GetChannelInsightsUseCase({ channelRepository, channelInsightsRepository })

    const result = await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(result).toBeNull()
  })

  it("should throw when the channel belongs to another tenant", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await seedChannel(channelRepository, "tenant-1")
    const channelInsightsRepository = new InMemoryChannelInsightsRepository()
    const useCase = new GetChannelInsightsUseCase({ channelRepository, channelInsightsRepository })

    await expect(
      useCase.execute({ tenantId: "someone-else", channelId: "channel-1" }),
    ).rejects.toThrow(ChannelNotFoundError)
  })
})
