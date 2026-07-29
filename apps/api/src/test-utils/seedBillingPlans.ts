import { Plan } from "../domain/billing/entities/Plan"
import type { InMemoryPlanRepository } from "./fakes/InMemoryPlanRepository"

/** Mirrors the plans seeded in packages/database/prisma/seed.ts, with fake Stripe price ids. */
export function seedBillingPlans(planRepository: InMemoryPlanRepository): void {
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
  planRepository.seed(
    Plan.create({
      id: "starter-plan",
      name: "STARTER",
      maxChannels: 1,
      maxVideosPerDayPerChannel: 3,
      priceCents: 4900,
      stripePriceId: "price_starter_test",
    }),
  )
  planRepository.seed(
    Plan.create({
      id: "pro-plan",
      name: "PRO",
      maxChannels: 3,
      maxVideosPerDayPerChannel: 5,
      priceCents: 14900,
      stripePriceId: "price_pro_test",
    }),
  )
  planRepository.seed(
    Plan.create({
      id: "agency-plan",
      name: "AGENCY",
      maxChannels: 10,
      maxVideosPerDayPerChannel: 10,
      priceCents: 49900,
      stripePriceId: "price_agency_test",
    }),
  )
}
