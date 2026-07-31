import { randomBytes } from "node:crypto"
import { Channel } from "../../../domain/channel-management/entities/Channel"
import { SocialAccount } from "../../../domain/channel-management/entities/SocialAccount"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { InvalidOAuthStateError } from "../../../domain/channel-management/errors/InvalidOAuthStateError"
import { OAuthExchangeFailedError } from "../../../domain/channel-management/errors/OAuthExchangeFailedError"
import { SocialAccountNotFoundError } from "../../../domain/channel-management/errors/SocialAccountNotFoundError"
import { IsChannelReadyToPublishSpecification } from "../../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { AesGcmEncryptor } from "../../../infrastructure/crypto/AesGcmEncryptor"
import { HmacOAuthStateSigner } from "../../../infrastructure/oauth/HmacOAuthStateSigner"
import { FakeChannelScheduleEventPublisher } from "../../../test-utils/fakes/FakeChannelScheduleEventPublisher"
import { FakeSocialOAuthAdapter } from "../../../test-utils/fakes/FakeSocialOAuthAdapter"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { ReauthSocialAccountUseCase } from "./ReauthSocialAccountUseCase"

const stateSigner = new HmacOAuthStateSigner("test-secret-1234567890")

async function buildScenario(channelStatus: "ACTIVE" | "DRAFT" = "ACTIVE") {
  const channelRepository = new InMemoryChannelRepository()
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const channelScheduleEventPublisher = new FakeChannelScheduleEventPublisher()
  const useCase = new ReauthSocialAccountUseCase({
    channelRepository,
    socialAccountRepository,
    oauthAdapters: { YOUTUBE: new FakeSocialOAuthAdapter() },
    oauthStateSigner: stateSigner,
    tokenEncryptor: new AesGcmEncryptor(randomBytes(32), 1),
    isChannelReadyToPublishSpecification: new IsChannelReadyToPublishSpecification(),
    channelScheduleEventPublisher,
  })

  const channel = Channel.create({
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
    status: channelStatus === "ACTIVE" ? "ACTIVE" : "DRAFT",
  })
  await channelRepository.save(channel)
  await socialAccountRepository.save(
    SocialAccount.create({
      id: "account-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      externalAccountId: "yt-1",
      status: "NEEDS_REAUTH",
      encryptedTokens: Buffer.from("stale"),
      tokenKeyVersion: 1,
      refreshExpiresAt: null,
      createdAt: new Date(),
    }),
  )

  return { useCase, channelRepository, socialAccountRepository, channelScheduleEventPublisher }
}

function validState() {
  return stateSigner.sign({ tenantId: "tenant-1", channelId: "channel-1", platform: "YOUTUBE" })
}

describe("ReauthSocialAccountUseCase", () => {
  it("should reconnect a NEEDS_REAUTH account", async () => {
    const { useCase } = await buildScenario()

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      accountId: "account-1",
      code: "auth-code",
      state: validState(),
    })

    expect(result.status).toBe("CONNECTED")
  })

  it("should activate a DRAFT channel once the reconnected account satisfies readiness", async () => {
    const { useCase, channelRepository, channelScheduleEventPublisher } =
      await buildScenario("DRAFT")

    await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      accountId: "account-1",
      code: "auth-code",
      state: validState(),
    })

    const channel = await channelRepository.findById("channel-1", "tenant-1")
    expect(channel?.status).toBe("ACTIVE")
    expect(channelScheduleEventPublisher.registered).toEqual([
      expect.objectContaining({ channelId: "channel-1" }),
    ])
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "ghost",
        accountId: "account-1",
        code: "auth-code",
        state: validState(),
      }),
    ).rejects.toThrow(ChannelNotFoundError)
  })

  it("should reject when the account does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        accountId: "ghost",
        code: "auth-code",
        state: validState(),
      }),
    ).rejects.toThrow(SocialAccountNotFoundError)
  })

  it("should reject an invalid state", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        accountId: "account-1",
        code: "auth-code",
        state: "tampered",
      }),
    ).rejects.toThrow(InvalidOAuthStateError)
  })

  it("should map an adapter failure to OAuthExchangeFailedError", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        accountId: "account-1",
        code: "invalid-code",
        state: validState(),
      }),
    ).rejects.toThrow(OAuthExchangeFailedError)
  })
})
