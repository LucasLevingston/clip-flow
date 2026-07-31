import { Channel } from "../../../domain/channel-management/entities/Channel"
import { SocialAccount } from "../../../domain/channel-management/entities/SocialAccount"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { SocialAccountAlreadyConnectedError } from "../../../domain/channel-management/errors/SocialAccountAlreadyConnectedError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { HmacOAuthStateSigner } from "../../../infrastructure/oauth/HmacOAuthStateSigner"
import { FakeSocialOAuthAdapter } from "../../../test-utils/fakes/FakeSocialOAuthAdapter"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { GetSocialAccountOAuthUrlUseCase } from "./GetSocialAccountOAuthUrlUseCase"

async function buildScenario() {
  const channelRepository = new InMemoryChannelRepository()
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const useCase = new GetSocialAccountOAuthUrlUseCase({
    channelRepository,
    socialAccountRepository,
    oauthAdapters: { YOUTUBE: new FakeSocialOAuthAdapter() },
    oauthStateSigner: new HmacOAuthStateSigner("test-secret-1234567890"),
  })

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

describe("GetSocialAccountOAuthUrlUseCase", () => {
  it("should return an authorization URL carrying a signed state", async () => {
    const { useCase } = await buildScenario()

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
    })

    expect(result.url).toContain("https://oauth.test.local/authorize?state=")
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "ghost", platform: "YOUTUBE" }),
    ).rejects.toThrow(ChannelNotFoundError)
  })

  it("should reject when the platform is already connected", async () => {
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

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", platform: "YOUTUBE" }),
    ).rejects.toThrow(SocialAccountAlreadyConnectedError)
  })

  it("should allow requesting a new URL when the existing account needs reauth", async () => {
    const { useCase, socialAccountRepository } = await buildScenario()
    await socialAccountRepository.save(
      SocialAccount.create({
        id: "account-1",
        channelId: "channel-1",
        platform: "YOUTUBE",
        externalAccountId: "yt-1",
        status: "NEEDS_REAUTH",
        encryptedTokens: Buffer.from("x"),
        tokenKeyVersion: 1,
        refreshExpiresAt: null,
        createdAt: new Date(),
      }),
    )

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
    })

    expect(result.url).toContain("https://oauth.test.local/authorize?state=")
  })
})
