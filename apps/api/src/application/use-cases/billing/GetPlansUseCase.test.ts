import { Plan } from "../../../domain/billing/entities/Plan"
import { InMemoryPlanRepository } from "../../../test-utils/fakes/InMemoryPlanRepository"
import { GetPlansUseCase } from "./GetPlansUseCase"

describe("GetPlansUseCase", () => {
  it("should list plans without leaking stripePriceId", async () => {
    const planRepository = new InMemoryPlanRepository()
    planRepository.seed(
      Plan.create({
        id: "plan-1",
        name: "PRO",
        maxChannels: 3,
        maxVideosPerDayPerChannel: 5,
        priceCents: 14900,
        stripePriceId: "price_pro_123",
      }),
    )
    const useCase = new GetPlansUseCase({ planRepository })

    const result = await useCase.execute()

    expect(result).toEqual([
      {
        id: "plan-1",
        name: "PRO",
        maxChannels: 3,
        maxVideosPerDayPerChannel: 5,
        priceCents: 14900,
      },
    ])
  })
})
