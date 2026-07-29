import { Plan } from "../../../domain/billing/entities/Plan"
import { PlanNotFoundError } from "../../../domain/billing/errors/PlanNotFoundError"
import { FakeCheckoutSessionProvider } from "../../../test-utils/fakes/FakeCheckoutSessionProvider"
import { InMemoryPlanRepository } from "../../../test-utils/fakes/InMemoryPlanRepository"
import { InMemoryUserRepository } from "../../../test-utils/fakes/InMemoryUserRepository"
import { User } from "../../../domain/identity/entities/User"
import { CreateCheckoutSessionUseCase } from "./CreateCheckoutSessionUseCase"

function buildUseCase() {
  const planRepository = new InMemoryPlanRepository()
  const userRepository = new InMemoryUserRepository()
  const checkoutSessionProvider = new FakeCheckoutSessionProvider()
  const useCase = new CreateCheckoutSessionUseCase({
    planRepository,
    userRepository,
    checkoutSessionProvider,
  })
  return { useCase, planRepository, userRepository, checkoutSessionProvider }
}

describe("CreateCheckoutSessionUseCase", () => {
  it("should create a checkout session for a purchasable plan", async () => {
    const { useCase, planRepository, userRepository, checkoutSessionProvider } = buildUseCase()
    planRepository.seed(
      Plan.create({
        id: "plan-pro",
        name: "PRO",
        maxChannels: 3,
        maxVideosPerDayPerChannel: 5,
        priceCents: 14900,
        stripePriceId: "price_pro_123",
      }),
    )
    await userRepository.save(
      User.create({ id: "user-1", email: "owner@example.com", passwordHash: "hash" }),
    )

    const result = await useCase.execute({
      tenantId: "tenant-1",
      userId: "user-1",
      planId: "plan-pro",
    })

    expect(result.checkoutUrl).toContain("tenant-1")
    expect(checkoutSessionProvider.calls[0]).toEqual({
      tenantId: "tenant-1",
      customerEmail: "owner@example.com",
      stripePriceId: "price_pro_123",
    })
  })

  it("should reject when the plan does not exist", async () => {
    const { useCase } = buildUseCase()

    await expect(
      useCase.execute({ tenantId: "tenant-1", userId: "user-1", planId: "ghost-plan" }),
    ).rejects.toThrow(PlanNotFoundError)
  })

  it("should reject when the plan has no stripePriceId", async () => {
    const { useCase, planRepository } = buildUseCase()
    planRepository.seed(
      Plan.create({
        id: "trial-plan",
        name: "TRIAL",
        maxChannels: 1,
        maxVideosPerDayPerChannel: 1,
        priceCents: 0,
        stripePriceId: null,
      }),
    )

    await expect(
      useCase.execute({ tenantId: "tenant-1", userId: "user-1", planId: "trial-plan" }),
    ).rejects.toThrow(PlanNotFoundError)
  })

  it("should reject when the authenticated user no longer exists", async () => {
    const { useCase, planRepository } = buildUseCase()
    planRepository.seed(
      Plan.create({
        id: "plan-pro",
        name: "PRO",
        maxChannels: 3,
        maxVideosPerDayPerChannel: 5,
        priceCents: 14900,
        stripePriceId: "price_pro_123",
      }),
    )

    await expect(
      useCase.execute({ tenantId: "tenant-1", userId: "ghost-user", planId: "plan-pro" }),
    ).rejects.toThrow('User "ghost-user" not found')
  })
})
