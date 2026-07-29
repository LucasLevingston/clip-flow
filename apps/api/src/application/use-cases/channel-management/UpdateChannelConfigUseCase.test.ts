import { Plan } from "../../../domain/billing/entities/Plan"
import { Subscription } from "../../../domain/billing/entities/Subscription"
import { PlanLimitExceededError } from "../../../domain/billing/errors/PlanLimitExceededError"
import { PlanLimitsPolicy } from "../../../domain/billing/policies/PlanLimitsPolicy"
import { Channel } from "../../../domain/channel-management/entities/Channel"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { NicheImmutableError } from "../../../domain/channel-management/errors/NicheImmutableError"
import { PublishTimesCountMismatchError } from "../../../domain/channel-management/errors/PublishTimesCountMismatchError"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { FakeChannelScheduleEventPublisher } from "../../../test-utils/fakes/FakeChannelScheduleEventPublisher"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemoryPlanRepository } from "../../../test-utils/fakes/InMemoryPlanRepository"
import { InMemorySubscriptionRepository } from "../../../test-utils/fakes/InMemorySubscriptionRepository"
import { UpdateChannelConfigUseCase } from "./UpdateChannelConfigUseCase"

async function buildScenario() {
  const channelRepository = new InMemoryChannelRepository()
  const subscriptionRepository = new InMemorySubscriptionRepository()
  const planRepository = new InMemoryPlanRepository()
  const channelScheduleEventPublisher = new FakeChannelScheduleEventPublisher()
  const useCase = new UpdateChannelConfigUseCase({
    channelRepository,
    subscriptionRepository,
    planRepository,
    planLimitsPolicy: new PlanLimitsPolicy(),
    channelScheduleEventPublisher,
  })

  planRepository.seed(
    Plan.create({
      id: "plan-1",
      name: "STARTER",
      maxChannels: 3,
      maxVideosPerDayPerChannel: 3,
      priceCents: 4900,
      stripePriceId: null,
    }),
  )
  await subscriptionRepository.save(
    Subscription.create({
      id: "sub-1",
      tenantId: "tenant-1",
      planId: "plan-1",
      status: "ACTIVE",
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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

  return { useCase, channelRepository, channelScheduleEventPublisher }
}

describe("UpdateChannelConfigUseCase", () => {
  it("should update the channel's name", async () => {
    const { useCase, channelScheduleEventPublisher } = await buildScenario()

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      name: "Novo Nome",
    })

    expect(result.name).toBe("Novo Nome")
    expect(result.status).toBe("DRAFT")
    expect(channelScheduleEventPublisher.removed).toEqual([
      expect.objectContaining({ channelId: "channel-1" }),
    ])
  })

  it("should update videosPerDay and publishTimes together", async () => {
    const { useCase } = await buildScenario()

    const result = await useCase.execute({
      tenantId: "tenant-1",
      channelId: "channel-1",
      videosPerDay: 2,
      publishTimes: ["09:00", "18:00"],
    })

    expect(result.publishTimes).toEqual(["09:00", "18:00"])
  })

  it("should reject a publishTimes count mismatch", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", videosPerDay: 2 }),
    ).rejects.toThrow(PublishTimesCountMismatchError)
  })

  it("should reject when the channel does not exist", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "ghost", name: "X" }),
    ).rejects.toThrow(ChannelNotFoundError)
  })

  it("should reject changing nicheId", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: "tenant-1", channelId: "channel-1", nicheId: "other-niche" }),
    ).rejects.toThrow(NicheImmutableError)
  })

  it("should reject videosPerDay above the plan's limit", async () => {
    const { useCase } = await buildScenario()

    await expect(
      useCase.execute({
        tenantId: "tenant-1",
        channelId: "channel-1",
        videosPerDay: 4,
        publishTimes: ["09:00", "12:00", "15:00", "18:00"],
      }),
    ).rejects.toThrow(PlanLimitExceededError)
  })
})
