import { Plan } from "../../billing/entities/Plan"
import { PlanLimitExceededError } from "../../billing/errors/PlanLimitExceededError"
import { PlanLimitsPolicy } from "../../billing/policies/PlanLimitsPolicy"
import { PublishSlotAllocator } from "../services/PublishSlotAllocator"
import { TimeOfDay } from "../value-objects/TimeOfDay"
import { ChannelFactory } from "./ChannelFactory"

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

function buildFactory(): ChannelFactory {
  return new ChannelFactory(new PublishSlotAllocator(), new PlanLimitsPolicy())
}

function baseInput(overrides: Partial<Parameters<ChannelFactory["create"]>[0]> = {}) {
  return {
    id: "channel-1",
    tenantId: "tenant-1",
    nicheId: "niche-1",
    name: "Meu Canal",
    language: "pt-BR",
    promptOverride: null,
    videosPerDay: 2,
    publishTimes: null,
    generationTime: TimeOfDay.create(6, 0),
    platforms: "SHORTS_ONLY" as const,
    thumbnailEnabled: true,
    plan: buildPlan(3, 5),
    currentChannelCount: 0,
    ...overrides,
  }
}

describe("ChannelFactory", () => {
  it("should create a channel in DRAFT with auto-allocated publish times", () => {
    const channel = buildFactory().create(baseInput())

    expect(channel.status).toBe("DRAFT")
    expect(channel.publishTimes).toHaveLength(2)
  })

  it("should use explicit publish times when provided", () => {
    const channel = buildFactory().create(
      baseInput({ publishTimes: [TimeOfDay.create(9, 0), TimeOfDay.create(20, 0)] }),
    )

    expect(channel.publishTimes.map((t) => t.format())).toEqual(["09:00", "20:00"])
  })

  it("should reject creating a channel at the plan's channel limit", () => {
    expect(() => buildFactory().create(baseInput({ currentChannelCount: 3 }))).toThrow(
      PlanLimitExceededError,
    )
  })

  it("should reject videosPerDay above the plan's limit", () => {
    expect(() => buildFactory().create(baseInput({ videosPerDay: 6, publishTimes: null }))).toThrow(
      PlanLimitExceededError,
    )
  })
})
