import { Plan } from "../entities/Plan"
import { PlanLimitsPolicy } from "./PlanLimitsPolicy"

function buildPlan(maxChannels: number, maxVideosPerDayPerChannel: number): Plan {
  return Plan.create({
    id: "plan-1",
    name: "STARTER",
    maxChannels,
    maxVideosPerDayPerChannel,
    priceCents: 4900,
    stripePriceId: null,
  })
}

describe("PlanLimitsPolicy", () => {
  const policy = new PlanLimitsPolicy()

  it("should allow creating a channel when under the limit", () => {
    expect(policy.canCreateChannel(buildPlan(3, 5), 2)).toBe(true)
  })

  it("should block creating a channel at the limit", () => {
    expect(policy.canCreateChannel(buildPlan(3, 5), 3)).toBe(false)
  })

  it("should allow videosPerDay at the limit", () => {
    expect(policy.isVideosPerDayWithinLimit(buildPlan(3, 5), 5)).toBe(true)
  })

  it("should block videosPerDay above the limit", () => {
    expect(policy.isVideosPerDayWithinLimit(buildPlan(3, 5), 6)).toBe(false)
  })
})
