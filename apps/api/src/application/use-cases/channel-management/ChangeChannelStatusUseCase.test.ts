import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { ChannelNotReadyError } from "../../../domain/channel-management/errors/ChannelNotReadyError"
import { SocialAccount } from "../../../domain/channel-management/entities/SocialAccount"
import { IsChannelReadyToPublishSpecification } from "../../../domain/channel-management/services/IsChannelReadyToPublishSpecification"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemorySocialAccountRepository } from "../../../test-utils/fakes/InMemorySocialAccountRepository"
import { ChangeChannelStatusUseCase } from "./ChangeChannelStatusUseCase"

async function buildScenario(platforms: "SHORTS_ONLY" | "BOTH" = "SHORTS_ONLY") {
  const channelRepository = new InMemoryChannelRepository()
  const socialAccountRepository = new InMemorySocialAccountRepository()
  const useCase = new ChangeChannelStatusUseCase({
    channelRepository,
    socialAccountRepository,
    isChannelReadyToPublishSpecification: new IsChannelReadyToPublishSpecification(),
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

describe("ChangeChannelStatusUseCase", () => {
  it("should activate a DRAFT channel when the required social account is connected", async () => {
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

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      status: "ACTIVE",
    })

    expect(result.status).toBe("ACTIVE")
  })

  it("should reject activating when a required social account is missing", async () => {
    const { useCase } = await buildScenario("BOTH")

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", status: "ACTIVE" }),
    ).rejects.toThrow(ChannelNotReadyError)
  })

  it("should pause an active channel", async () => {
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
    await useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", status: "ACTIVE" })

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      status: "PAUSED",
    })

    expect(result.status).toBe("PAUSED")
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "ghost", status: "PAUSED" }),
    ).rejects.toThrow(ChannelNotFoundError)
  })
})
