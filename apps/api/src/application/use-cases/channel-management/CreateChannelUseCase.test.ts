import { Niche } from "../../../domain/catalog/entities/Niche"
import { Plan } from "../../../domain/billing/entities/Plan"
import { Subscription } from "../../../domain/billing/entities/Subscription"
import { PlanLimitExceededError } from "../../../domain/billing/errors/PlanLimitExceededError"
import { PlanLimitsPolicy } from "../../../domain/billing/policies/PlanLimitsPolicy"
import { NicheInactiveError } from "../../../domain/channel-management/errors/NicheInactiveError"
import { ChannelFactory } from "../../../domain/channel-management/factories/ChannelFactory"
import { PublishSlotAllocator } from "../../../domain/channel-management/services/PublishSlotAllocator"
import { FakeChannelUsageProvider } from "../../../test-utils/fakes/FakeChannelUsageProvider"
import { FakeIdGenerator } from "../../../test-utils/fakes/FakeIdGenerator"
import { InMemoryChannelRepository } from "../../../test-utils/fakes/InMemoryChannelRepository"
import { InMemoryNicheRepository } from "../../../test-utils/fakes/InMemoryNicheRepository"
import { InMemoryPlanRepository } from "../../../test-utils/fakes/InMemoryPlanRepository"
import { InMemorySubscriptionRepository } from "../../../test-utils/fakes/InMemorySubscriptionRepository"
import { CreateChannelUseCase } from "./CreateChannelUseCase"

function buildUseCase() {
  const nicheRepository = new InMemoryNicheRepository()
  const subscriptionRepository = new InMemorySubscriptionRepository()
  const planRepository = new InMemoryPlanRepository()
  const channelUsageProvider = new FakeChannelUsageProvider()
  const channelRepository = new InMemoryChannelRepository()
  const channelFactory = new ChannelFactory(new PublishSlotAllocator(), new PlanLimitsPolicy())
  const useCase = new CreateChannelUseCase({
    nicheRepository,
    subscriptionRepository,
    planRepository,
    channelUsageProvider,
    channelFactory,
    channelRepository,
    idGenerator: new FakeIdGenerator(),
  })

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
  planRepository.seed(
    Plan.create({
      id: "plan-1",
      name: "STARTER",
      maxChannels: 1,
      maxVideosPerDayPerChannel: 3,
      priceCents: 4900,
      stripePriceId: null,
    }),
  )

  return {
    useCase,
    nicheRepository,
    subscriptionRepository,
    planRepository,
    channelUsageProvider,
    channelRepository,
  }
}

async function seedSubscription(
  repo: InMemorySubscriptionRepository,
  tenantId: string,
  planId: string,
) {
  await repo.save(
    Subscription.create({
      id: `sub-${tenantId}`,
      tenantId,
      planId,
      status: "ACTIVE",
      currentPeriodEnd: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
    }),
  )
}

function baseInput(overrides: Partial<Parameters<CreateChannelUseCase["execute"]>[0]> = {}) {
  return {
    tenantId: "tenant-1",
    nicheId: "niche-1",
    name: "Meu Canal",
    language: "pt-BR",
    promptOverride: null,
    videosPerDay: 2,
    publishTimes: null,
    generationTime: "06:00",
    platforms: "SHORTS_ONLY" as const,
    thumbnailEnabled: true,
    ...overrides,
  }
}

describe("CreateChannelUseCase", () => {
  it("should create a channel in DRAFT with auto-allocated publish times", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await seedSubscription(subscriptionRepository, "tenant-1", "plan-1")

    const result = await useCase.execute(baseInput())

    expect(result.status).toBe("DRAFT")
    expect(result.publishTimes).toHaveLength(2)
    expect(result.nicheId).toBe("niche-1")
  })

  it("should reject when the niche is not active", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await seedSubscription(subscriptionRepository, "tenant-1", "plan-1")

    await expect(useCase.execute(baseInput({ nicheId: "ghost-niche" }))).rejects.toThrow(
      NicheInactiveError,
    )
  })

  it("should reject when the tenant is at the plan's channel limit", async () => {
    const { useCase, subscriptionRepository, channelUsageProvider } = buildUseCase()
    await seedSubscription(subscriptionRepository, "tenant-1", "plan-1")
    channelUsageProvider.setCount("tenant-1", 1)

    await expect(useCase.execute(baseInput())).rejects.toThrow(PlanLimitExceededError)
  })
})
