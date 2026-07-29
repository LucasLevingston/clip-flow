import { PlanLimitExceededError } from "../../billing/errors/PlanLimitExceededError"
import type { Plan } from "../../billing/entities/Plan"
import type { PlanLimitsPolicy } from "../../billing/policies/PlanLimitsPolicy"
import { Channel, type ChannelPlatforms } from "../entities/Channel"
import type { PublishSlotAllocator } from "../services/PublishSlotAllocator"
import type { TimeOfDay } from "../value-objects/TimeOfDay"

export interface ChannelFactoryInput {
  id: string
  tenantId: string
  nicheId: string
  name: string
  language: string
  promptOverride: string | null
  videosPerDay: number
  publishTimes: TimeOfDay[] | null
  generationTime: TimeOfDay
  platforms: ChannelPlatforms
  thumbnailEnabled: boolean
  plan: Plan
  currentChannelCount: number
}

/** Validates PlanLimitsPolicy (channel count + videos/day) then creates the Channel in DRAFT. */
export class ChannelFactory {
  constructor(
    private readonly publishSlotAllocator: PublishSlotAllocator,
    private readonly planLimitsPolicy: PlanLimitsPolicy,
  ) {}

  create(input: ChannelFactoryInput): Channel {
    if (!this.planLimitsPolicy.canCreateChannel(input.plan, input.currentChannelCount)) {
      throw new PlanLimitExceededError("channels")
    }
    if (!this.planLimitsPolicy.isVideosPerDayWithinLimit(input.plan, input.videosPerDay)) {
      throw new PlanLimitExceededError("videosPerDay")
    }

    const publishTimes =
      input.publishTimes ?? this.publishSlotAllocator.allocate(input.videosPerDay)

    return Channel.create({
      id: input.id,
      tenantId: input.tenantId,
      nicheId: input.nicheId,
      name: input.name,
      language: input.language,
      promptOverride: input.promptOverride,
      videosPerDay: input.videosPerDay,
      publishTimes,
      generationTime: input.generationTime,
      platforms: input.platforms,
      thumbnailEnabled: input.thumbnailEnabled,
    })
  }
}
