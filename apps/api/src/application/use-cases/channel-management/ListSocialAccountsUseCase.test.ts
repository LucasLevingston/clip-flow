import { Channel } from "../../../domain/channel-management/entities/Channel"
import { SocialAccount } from "../../../domain/channel-management/entities/SocialAccount"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { ListSocialAccountsUseCase } from "./ListSocialAccountsUseCase"

async function buildScenario() {
  const channelRepository = new InMemoryChannelRepository()
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const useCase = new ListSocialAccountsUseCase({ channelRepository, socialAccountRepository })

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

  return { useCase, socialAccountRepository }
}

describe("ListSocialAccountsUseCase", () => {
  it("should list connected accounts for the channel", async () => {
    const { useCase, socialAccountRepository } = await buildScenario()
    await socialAccountRepository.save(
      SocialAccount.create({
        id: "account-1",
        channelId: "channel-1",
        platform: "YOUTUBE",
        externalAccountId: "yt-1",
        status: "CONNECTED",
        encryptedTokens: Buffer.from("x"),
        tokenKeyVersion: 1,
        refreshExpiresAt: null,
        createdAt: new Date(),
      }),
    )

    const result = await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1" })

    expect(result).toEqual([
      expect.objectContaining({ id: "account-1", platform: "YOUTUBE", status: "CONNECTED" }),
    ])
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(useCase.execute({ tenantId: "tenant-1", channelId: "ghost" })).rejects.toThrow(
      ChannelNotFoundError,
    )
  })
})
