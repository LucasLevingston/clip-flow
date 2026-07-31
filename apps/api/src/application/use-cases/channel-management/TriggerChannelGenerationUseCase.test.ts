import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotActiveError } from "../../../domain/channel-management/errors/ChannelNotActiveError"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { FakeGenerationTriggerPublisher } from "../../../test-utils/fakes/FakeGenerationTriggerPublisher"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { TriggerChannelGenerationUseCase } from "./TriggerChannelGenerationUseCase"

function buildChannel(status: "DRAFT" | "ACTIVE" | "PAUSED") {
  return Channel.create({
    id: "channel-1",
    tenantId: "tenant-1",
    nicheId: "niche-1",
    name: "Meu Canal",
    language: "pt-BR",
    promptOverride: null,
    videosPerDay: 1,
    publishTimes: [TimeOfDay.create(9, 0)],
    generationTime: TimeOfDay.create(6, 0),
    platforms: "SHORTS_ONLY",
    thumbnailEnabled: true,
    status,
  })
}

describe("TriggerChannelGenerationUseCase", () => {
  it("should publish a GenerationBatch trigger for an active channel", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await channelRepository.save(buildChannel("ACTIVE"))
    const generationTriggerPublisher = new FakeGenerationTriggerPublisher()
    const useCase = new TriggerChannelGenerationUseCase({
      channelRepository,
      generationTriggerPublisher,
    })

    await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(generationTriggerPublisher.published).toEqual([
      { channelId: "channel-1", tenantId: "tenant-1" },
    ])
  })

  it("should reject a DRAFT channel", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await channelRepository.save(buildChannel("DRAFT"))
    const generationTriggerPublisher = new FakeGenerationTriggerPublisher()
    const useCase = new TriggerChannelGenerationUseCase({
      channelRepository,
      generationTriggerPublisher,
    })

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })).rejects.toThrow(
      ChannelNotActiveError,
    )
    expect(generationTriggerPublisher.published).toEqual([])
  })

  it("should reject a PAUSED channel", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await channelRepository.save(buildChannel("PAUSED"))
    const useCase = new TriggerChannelGenerationUseCase({
      channelRepository,
      generationTriggerPublisher: new FakeGenerationTriggerPublisher(),
    })

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })).rejects.toThrow(
      ChannelNotActiveError,
    )
  })

  it("should reject when the channel does not exist", async () => {
    const useCase = new TriggerChannelGenerationUseCase({
      channelRepository: new InMemoryChannelRepository(),
      generationTriggerPublisher: new FakeGenerationTriggerPublisher(),
    })

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "ghost" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })

  it("should reject when the channel belongs to another tenant", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await channelRepository.save(buildChannel("ACTIVE"))
    const useCase = new TriggerChannelGenerationUseCase({
      channelRepository,
      generationTriggerPublisher: new FakeGenerationTriggerPublisher(),
    })

    await expect(useCase.execute({ tenantId: "tenant-2", channelId: "channel-1" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })
})
