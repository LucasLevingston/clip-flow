import { Channel } from "../../../domain/channel-management/entities/Channel"
import { SocialAccount } from "../../../domain/channel-management/entities/SocialAccount"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { SocialAccountNotFoundError } from "../../../domain/channel-management/errors/SocialAccountNotFoundError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { FakeChannelScheduleEventPublisher } from "../../../test-utils/fakes/FakeChannelScheduleEventPublisher"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { DisconnectSocialAccountUseCase } from "./DisconnectSocialAccountUseCase"

async function buildScenario(channelStatus: "ACTIVE" | "DRAFT" = "ACTIVE") {
  const channelRepository = new InMemoryChannelRepository()
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const channelScheduleEventPublisher = new FakeChannelScheduleEventPublisher()
  const useCase = new DisconnectSocialAccountUseCase({
    channelRepository,
    socialAccountRepository,
    channelScheduleEventPublisher,
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
      status: channelStatus,
    }),
  )
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

  return { useCase, channelRepository, socialAccountRepository, channelScheduleEventPublisher }
}

describe("DisconnectSocialAccountUseCase", () => {
  it("should soft-delete the account and revert an ACTIVE channel to DRAFT", async () => {
    const { useCase, channelRepository, socialAccountRepository, channelScheduleEventPublisher } =
      await buildScenario("ACTIVE")

    await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", accountId: "account-1" })

    expect(await socialAccountRepository.findById("account-1")).toBeNull()
    const channel = await channelRepository.findById("channel-1")
    expect(channel?.status).toBe("DRAFT")
    expect(channelScheduleEventPublisher.removed).toEqual([
      expect.objectContaining({ channelId: "channel-1" }),
    ])
  })

  it("should not touch a channel that is already DRAFT", async () => {
    const { useCase, channelScheduleEventPublisher } = await buildScenario("DRAFT")

    await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", accountId: "account-1" })

    expect(channelScheduleEventPublisher.removed).toEqual([])
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "ghost", accountId: "account-1" }),
    ).rejects.toThrow(ChannelNotFoundError)
  })

  it("should reject when the account does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", accountId: "ghost" }),
    ).rejects.toThrow(SocialAccountNotFoundError)
  })
})
