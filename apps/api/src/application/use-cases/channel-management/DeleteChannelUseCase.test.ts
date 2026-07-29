import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { DeleteChannelUseCase } from "./DeleteChannelUseCase"

describe("DeleteChannelUseCase", () => {
  it("should soft-delete the channel", async () => {
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
    const useCase = new DeleteChannelUseCase({ channelRepository })

    await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(await channelRepository.findById("channel-1")).toBeNull()
  })

  it("should reject when the channel does not exist", async () => {
    const channelRepository = new InMemoryChannelRepository()
    const useCase = new DeleteChannelUseCase({ channelRepository })

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
    const useCase = new DeleteChannelUseCase({ channelRepository })

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })
})
