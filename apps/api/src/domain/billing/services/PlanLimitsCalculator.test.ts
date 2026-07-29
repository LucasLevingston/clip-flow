import { Plan } from "../entities/Plan"
import { PlanLimitsCalculator } from "./PlanLimitsCalculator"

function createPlan(maxChannels: number): Plan {
  return Plan.create({
    id: "plan-1",
    name: "PRO",
    maxChannels,
    maxVideosPerDayPerChannel: 5,
    priceCents: 14900,
    stripePriceId: null,
  })
}

describe("PlanLimitsCalculator", () => {
  it("should report current usage against the plan's channel limit", () => {
    const calculator = new PlanLimitsCalculator()

    expect(calculator.calculateChannelUsage(createPlan(3), 2)).toEqual({ current: 2, max: 3 })
  })

  it("should not flag usage within the limit as exceeding", () => {
    const calculator = new PlanLimitsCalculator()

    expect(calculator.exceedsChannelLimit(createPlan(3), 3)).toBe(false)
  })

  it("should flag usage above the limit as exceeding", () => {
    const calculator = new PlanLimitsCalculator()

    expect(calculator.exceedsChannelLimit(createPlan(3), 4)).toBe(true)
  })
})
