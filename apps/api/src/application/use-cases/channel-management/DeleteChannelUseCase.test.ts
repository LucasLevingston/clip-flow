import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { FakeChannelScheduleEventPublisher } from "../../../test-utils/fakes/FakeChannelScheduleEventPublisher"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { DeleteChannelUseCase } from "./DeleteChannelUseCase"

describe("DeleteChannelUseCase", () => {
  it("should soft-delete the channel and publish a DELETED schedule event", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await channelRepository.save(
      Channel.create({
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
      }),
    )
    const channelScheduleEventPublisher = new FakeChannelScheduleEventPublisher()
    const useCase = new DeleteChannelUseCase({ channelRepository, channelScheduleEventPublisher })

    await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(await channelRepository.findById("channel-1", "tenant-1")).toBeNull()
    expect(channelScheduleEventPublisher.removed).toEqual([
      expect.objectContaining({ channelId: "channel-1" }),
    ])
  })

  it("should reject when the channel does not exist", async () => {
    const channelRepository = new InMemoryChannelRepository()
    const useCase = new DeleteChannelUseCase({
      channelRepository,
      channelScheduleEventPublisher: new FakeChannelScheduleEventPublisher(),
    })

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "ghost" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })

  it("should reject when the channel belongs to another tenant", async () => {
    const channelRepository = new InMemoryChannelRepository()
    await channelRepository.save(
      Channel.create({
        id: "channel-1",
        tenantId: "tenant-2",
        nicheId: "niche-1",
        name: "Meu Canal",
        language: "pt-BR",
        promptOverride: null,
        videosPerDay: 1,
        publishTimes: [TimeOfDay.create(9, 0)],
        generationTime: TimeOfDay.create(6, 0),
        platforms: "SHORTS_ONLY",
        thumbnailEnabled: true,
      }),
    )
    const useCase = new DeleteChannelUseCase({
      channelRepository,
      channelScheduleEventPublisher: new FakeChannelScheduleEventPublisher(),
    })

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })
})
