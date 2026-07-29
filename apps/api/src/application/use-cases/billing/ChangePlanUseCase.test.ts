import { Plan } from "../../../domain/billing/entities/Plan"
import { Subscription } from "../../../domain/billing/entities/Subscription"
import { DowngradeBlockedByUsageError } from "../../../domain/billing/errors/DowngradeBlockedByUsageError"
import { PlanNotFoundError } from "../../../domain/billing/errors/PlanNotFoundError"
import { PlanLimitsCalculator } from "../../../domain/billing/services/PlanLimitsCalculator"
import { FakeChannelUsageProvider } from "../../../test-utils/fakes/FakeChannelUsageProvider"
import { InMemoryPlanRepository } from "../../../test-utils/fakes/InMemoryPlanRepository"
import { InMemorySubscriptionRepository } from "../../../test-utils/fakes/InMemorySubscriptionRepository"
import { ChangePlanUseCase } from "./ChangePlanUseCase"

function buildUseCase() {
  const planRepository = new InMemoryPlanRepository()
  const subscriptionRepository = new InMemorySubscriptionRepository()
  const channelUsageProvider = new FakeChannelUsageProvider()
  const useCase = new ChangePlanUseCase({
    planRepository,
    subscriptionRepository,
    channelUsageProvider,
    planLimitsCalculator: new PlanLimitsCalculator(),
  })

  planRepository.seed(
    Plan.create({
      id: "plan-starter",
      name: "STARTER",
      maxChannels: 1,
      maxVideosPerDayPerChannel: 3,
      priceCents: 4900,
      stripePriceId: null,
    }),
  )
  planRepository.seed(
    Plan.create({
      id: "plan-pro",
      name: "PRO",
      maxChannels: 3,
      maxVideosPerDayPerChannel: 5,
      priceCents: 14900,
      stripePriceId: null,
    }),
  )

  return { useCase, planRepository, subscriptionRepository, channelUsageProvider }
}

describe("ChangePlanUseCase", () => {
  it("should upgrade the plan", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await subscriptionRepository.save(
      Subscription.create({
        id: "sub-1",
        tenantId: "tenant-1",
        planId: "plan-starter",
        status: "ACTIVE",
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
      }),
    )

    const result = await useCase.execute({ tenantId: "tenant-1", planId: "plan-pro" })

    expect(result.plan).toEqual({ id: "plan-pro", name: "PRO" })
    const updated = await subscriptionRepository.findByTenantId("tenant-1")
    expect(updated?.planId).toBe("plan-pro")
  })

  it("should allow a downgrade when usage fits the new plan's limits", async () => {
    const { useCase, subscriptionRepository, channelUsageProvider } = buildUseCase()
    channelUsageProvider.setCount("tenant-1", 1)
    await subscriptionRepository.save(
      Subscription.create({
        id: "sub-1",
        tenantId: "tenant-1",
        planId: "plan-pro",
        status: "ACTIVE",
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
      }),
    )

    const result = await useCase.execute({ tenantId: "tenant-1", planId: "plan-starter" })

    expect(result.plan).toEqual({ id: "plan-starter", name: "STARTER" })
  })

  it("should block a downgrade that would exceed the new plan's channel limit", async () => {
    const { useCase, subscriptionRepository, channelUsageProvider } = buildUseCase()
    channelUsageProvider.setCount("tenant-1", 3)
    await subscriptionRepository.save(
      Subscription.create({
        id: "sub-1",
        tenantId: "tenant-1",
        planId: "plan-pro",
        status: "ACTIVE",
        currentPeriodEnd: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
      }),
    )

    await expect(useCase.execute({ tenantId: "tenant-1", planId: "plan-starter" })).rejects.toThrow(
      DowngradeBlockedByUsageError,
    )
  })

  it("should reject when the target plan does not exist", async () => {
    const { useCase } = buildUseCase()

    await expect(useCase.execute({ tenantId: "tenant-1", planId: "ghost-plan" })).rejects.toThrow(
      PlanNotFoundError,
    )
  })

  it("should reject when the tenant has no subscription", async () => {
    const { useCase } = buildUseCase()

    await expect(useCase.execute({ tenantId: "ghost-tenant", planId: "plan-pro" })).rejects.toThrow(
      'Tenant "ghost-tenant" has no subscription',
    )
  })
})
