import { Niche } from "../../../domain/catalog/entities/Niche"
import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { SocialAccount } from "../../../domain/channel-management/entities/SocialAccount"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { GetChannelUseCase } from "./GetChannelUseCase"

function buildUseCase() {
  const channelRepository = new InMemoryChannelRepository()
  const nicheRepository = new InMemoryNicheRepository()
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const useCase = new GetChannelUseCase({
    channelRepository,
    nicheRepository,
    socialAccountRepository,
  })
  return { useCase, channelRepository, nicheRepository, socialAccountRepository }
}

describe("GetChannelUseCase", () => {
  it("should return channel detail with niche name and connected accounts", async () => {
    const { useCase, channelRepository, nicheRepository, socialAccountRepository } = buildUseCase()
    nicheRepository.seed(
      Niche.create({
        id: "niche-1",
        name: "Futebol",
        slug: "futebol",
        description: "desc",
        category: "Esportes",
        previewThumbnailUrl: null,
        status: "ACTIVE",
        createdAt: new Date(),
      }),
    )
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
    await socialAccountRepository.save(
      SocialAccount.create({
        id: "account-1",
        channelId: "channel-1",
        platform: "YOUTUBE",
        externalAccountId: "yt-123",
        status: "CONNECTED",
        encryptedTokens: Buffer.from("x"),
        tokenKeyVersion: 1,
        refreshExpiresAt: null,
        createdAt: new Date(),
      }),
    )

    const result = await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(result.nicheName).toBe("Futebol")
    expect(result.socialAccounts).toEqual([
      expect.objectContaining({ id: "account-1", platform: "YOUTUBE", status: "CONNECTED" }),
    ])
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = buildUseCase()

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "ghost" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })

  it("should reject when the channel belongs to another tenant", async () => {
    const { useCase, channelRepository } = buildUseCase()
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

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })
})
