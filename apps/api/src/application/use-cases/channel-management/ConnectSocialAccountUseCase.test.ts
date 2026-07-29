import { randomBytes } from "node:crypto"
import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { InvalidOAuthStateError } from "../../../domain/channel-management/errors/InvalidOAuthStateError"
import { OAuthExchangeFailedError } from "../../../domain/channel-management/errors/OAuthExchangeFailedError"
import { SocialAccountAlreadyConnectedError } from "../../../domain/channel-management/errors/SocialAccountAlreadyConnectedError"
import { SocialAccountFactory } from "../../../domain/channel-management/factories/SocialAccountFactory"
import { IsChannelReadyToPublishSpecification } from "../../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { AesGcmEncryptor } from "../../../infrastructure/crypto/AesGcmEncryptor"
import { HmacOAuthStateSigner } from "../../../infrastructure/oauth/HmacOAuthStateSigner"
import { FakeIdGenerator } from "../../../test-utils/fakes/FakeIdGenerator"
import { FakeSocialOAuthAdapter } from "../../../test-utils/fakes/FakeSocialOAuthAdapter"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { ConnectSocialAccountUseCase } from "./ConnectSocialAccountUseCase"

const stateSigner = new HmacOAuthStateSigner("test-secret")

async function buildScenario(platforms: "SHORTS_ONLY" | "BOTH" = "SHORTS_ONLY") {
  const channelRepository = new InMemoryChannelRepository()
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const oauthAdapters = { YOUTUBE: new FakeSocialOAuthAdapter() }
  const useCase = new ConnectSocialAccountUseCase({
    channelRepository,
    socialAccountRepository,
    oauthAdapters,
    oauthStateSigner: stateSigner,
    socialAccountFactory: new SocialAccountFactory(new AesGcmEncryptor(randomBytes(32), 1)),
    isChannelReadyToPublishSpecification: new IsChannelReadyToPublishSpecification(),
    idGenerator: new FakeIdGenerator(),
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
      platforms,
      thumbnailEnabled: true,
    }),
  )

  return { useCase, channelRepository, socialAccountRepository }
}

function validState() {
  return stateSigner.sign({ tenantId: "tenant-1", channelId: "channel-1", platform: "YOUTUBE" })
}

describe("ConnectSocialAccountUseCase", () => {
  it("should connect the account and activate a SHORTS_ONLY channel", async () => {
    const { useCase, channelRepository } = await buildScenario()

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      code: "auth-code",
      state: validState(),
    })

    expect(result.status).toBe("CONNECTED")
    const channel = await channelRepository.findById("channel-1")
    expect(channel?.status).toBe("ACTIVE")
  })

  it("should not activate a BOTH channel until both platforms are connected", async () => {
    const { useCase, channelRepository } = await buildScenario("BOTH")

    await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      code: "auth-code",
      state: validState(),
    })

    const channel = await channelRepository.findById("channel-1")
    expect(channel?.status).toBe("DRAFT")
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "ghost",
        platform: "YOUTUBE",
        code: "auth-code",
        state: validState(),
      }),
    ).rejects.toThrow(ChannelNotFoundError)
  })

  it("should reject an invalid state", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        platform: "YOUTUBE",
        code: "auth-code",
        state: "tampered",
      }),
    ).rejects.toThrow(InvalidOAuthStateError)
  })

  it("should reject a state issued for a different channel", async () => {
    const { useCase } = await buildScenario()
    const otherState = stateSigner.sign({
      tenantId: "tenant-1",
      channelId: "other-channel",
      platform: "YOUTUBE",
    })

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        platform: "YOUTUBE",
        code: "auth-code",
        state: otherState,
      }),
    ).rejects.toThrow(InvalidOAuthStateError)
  })

  it("should reject when the platform is already connected", async () => {
    const { useCase } = await buildScenario()
    await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      platform: "YOUTUBE",
      code: "auth-code",
      state: validState(),
    })

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        platform: "YOUTUBE",
        code: "auth-code",
        state: validState(),
      }),
    ).rejects.toThrow(SocialAccountAlreadyConnectedError)
  })

  it("should map an adapter failure to OAuthExchangeFailedError", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        platform: "YOUTUBE",
        code: "invalid-code",
        state: validState(),
      }),
    ).rejects.toThrow(OAuthExchangeFailedError)
  })
})
