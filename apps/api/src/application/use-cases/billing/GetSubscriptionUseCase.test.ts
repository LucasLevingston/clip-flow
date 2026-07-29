import { Plan } from "../../../domain/billing/entities/Plan"
import { Subscription } from "../../../domain/billing/entities/Subscription"
import { PlanLimitsCalculator } from "../../../domain/billing/services/PlanLimitsCalculator"
import { FakeChannelUsageProvider } from "../../../test-utils/fakes/FakeChannelUsageProvider"
import { InMemoryPlanRepository } from "../../../test-utils/fakes/InMemoryPlanRepository"
import { InMemorySubscriptionRepository } from "../../../test-utils/fakes/InMemorySubscriptionRepository"
import { GetSubscriptionUseCase } from "./GetSubscriptionUseCase"

function buildUseCase() {
  const planRepository = new InMemoryPlanRepository()
  const subscriptionRepository = new InMemorySubscriptionRepository()
  const channelUsageProvider = new FakeChannelUsageProvider()
  const useCase = new GetSubscriptionUseCase({
    planRepository,
    subscriptionRepository,
    channelUsageProvider,
    planLimitsCalculator: new PlanLimitsCalculator(),
  })
  return { useCase, planRepository, subscriptionRepository, channelUsageProvider }
}

describe("GetSubscriptionUseCase", () => {
  it("should return plan, status and channel usage", async () => {
    const { useCase, planRepository, subscriptionRepository, channelUsageProvider } = buildUseCase()
    planRepository.seed(
      Plan.create({
        id: "plan-1",
        name: "PRO",
        maxChannels: 3,
        maxVideosPerDayPerChannel: 5,
        priceCents: 14900,
        stripePriceId: null,
      }),
    )
    await subscriptionRepository.save(
      Subscription.create({
        id: "sub-1",
        tenantId: "tenant-1",
        planId: "plan-1",
        status: "ACTIVE",
        currentPeriodEnd: new Date("2026-08-01T00:00:00Z"),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
      }),
    )
    channelUsageProvider.setCount("tenant-1", 2)

    const result = await useCase.execute({ tenantId: "tenant-1" })

    expect(result).toEqual({
      plan: { id: "plan-1", name: "PRO" },
      status: "ACTIVE",
      currentPeriodEnd: new Date("2026-08-01T00:00:00Z"),
      usage: { channels: { current: 2, max: 3 } },
    })
  })

  it("should reject when the tenant has no subscription", async () => {
    const { useCase } = buildUseCase()

    await expect(useCase.execute({ tenantId: "ghost-tenant" })).rejects.toThrow(
      'Tenant "ghost-tenant" has no subscription',
    )
  })

  it("should reject when the subscription references an unknown plan", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await subscriptionRepository.save(
      Subscription.create({
        id: "sub-1",
        tenantId: "tenant-1",
        planId: "ghost-plan",
        status: "ACTIVE",
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
      }),
    )

    await expect(useCase.execute({ tenantId: "tenant-1" })).rejects.toThrow(
      'Subscription references unknown plan "ghost-plan"',
    )
  })
})
