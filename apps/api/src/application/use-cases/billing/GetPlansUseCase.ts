import type { PlanRepository } from "../../../domain/billing/repositories/PlanRepository"

export interface PlanSummary {
  id: string
  name: string
  maxChannels: number
  maxVideosPerDayPerChannel: number
  priceCents: number
}

export interface GetPlansUseCaseDeps {
  planRepository: PlanRepository
}

/** RF-08 — `GET /v1/plans`, public. Never exposes `stripePriceId`. */
export class GetPlansUseCase {
  constructor(private readonly deps: GetPlansUseCaseDeps) {}

  async execute(): Promise<PlanSummary[]> {
    const plans = await this.deps.planRepository.findAll()

    return plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      maxChannels: plan.maxChannels,
      maxVideosPerDayPerChannel: plan.maxVideosPerDayPerChannel,
      priceCents: plan.priceCents,
    }))
  }
}
