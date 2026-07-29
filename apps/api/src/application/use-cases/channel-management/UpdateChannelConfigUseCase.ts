import type { PlanRepository } from "../../../domain/billing/repositories/PlanRepository"
import type { SubscriptionRepository } from "../../../domain/billing/repositories/SubscriptionRepository"
import { PlanLimitExceededError } from "../../../domain/billing/errors/PlanLimitExceededError"
import type { PlanLimitsPolicy } from "../../../domain/billing/policies/PlanLimitsPolicy"
import { ChannelNotFoundError } from "../../../domain/channel-management/errors/ChannelNotFoundError"
import { NicheImmutableError } from "../../../domain/channel-management/errors/NicheImmutableError"
import {
  type Channel,
  type ChannelConfigInput,
  type ChannelPlatforms,
} from "../../../domain/channel-management/entities/Channel"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import { type ChannelDto, mapChannelToDto } from "./mapChannelToDto"

export interface UpdateChannelConfigInput {
  tenantId: string
  channelId: string
  nicheId?: string | undefined
  name?: string | undefined
  language?: string | undefined
  promptOverride?: string | undefined
  videosPerDay?: number | undefined
  publishTimes?: string[] | undefined
  generationTime?: string | undefined
  platforms?: ChannelPlatforms | undefined
  thumbnailEnabled?: boolean | undefined
}

export interface UpdateChannelConfigUseCaseDeps {
  channelRepository: ChannelRepository
  subscriptionRepository: SubscriptionRepository
  planRepository: PlanRepository
  planLimitsPolicy: PlanLimitsPolicy
}

/** RF-06 — `PATCH /v1/channels/:channelId`. Never affects an already-dispatched batch. */
export class UpdateChannelConfigUseCase {
  constructor(private readonly deps: UpdateChannelConfigUseCaseDeps) {}

  async execute(input: UpdateChannelConfigInput): Promise<ChannelDto> {
    const channel = await this.deps.channelRepository.findById(input.channelId)
    if (!channel || channel.tenantId !== input.tenantId) {
      throw new ChannelNotFoundError(input.channelId)
    }
    if (input.nicheId !== undefined) {
      throw new NicheImmutableError()
    }

    if (input.videosPerDay !== undefined) {
      await this.assertWithinPlanLimit(input.tenantId, input.videosPerDay)
    }

    const updated = channel.updateConfig(this.resolveConfig(channel, input))

    await this.deps.channelRepository.save(updated)
    return mapChannelToDto(updated)
  }

  private resolveConfig(channel: Channel, input: UpdateChannelConfigInput): ChannelConfigInput {
    return {
      name: input.name ?? channel.name,
      language: input.language ?? channel.language,
      promptOverride: input.promptOverride ?? channel.promptOverride,
      videosPerDay: input.videosPerDay ?? channel.videosPerDay,
      publishTimes: input.publishTimes
        ? input.publishTimes.map((time) => TimeOfDay.parse(time))
        : channel.publishTimes,
      generationTime: input.generationTime
        ? TimeOfDay.parse(input.generationTime)
        : channel.generationTime,
      platforms: input.platforms ?? channel.platforms,
      thumbnailEnabled: input.thumbnailEnabled ?? channel.thumbnailEnabled,
    }
  }

  private async assertWithinPlanLimit(tenantId: string, videosPerDay: number): Promise<void> {
    const subscription = await this.deps.subscriptionRepository.findByTenantId(tenantId)
    if (!subscription) {
      throw new Error(`Tenant "${tenantId}" has no subscription`)
    }
    const plan = await this.deps.planRepository.findById(subscription.planId)
    if (!plan) {
      throw new Error(`Subscription references unknown plan "${subscription.planId}"`)
    }
    if (!this.deps.planLimitsPolicy.isVideosPerDayWithinLimit(plan, videosPerDay)) {
      throw new PlanLimitExceededError("videosPerDay")
    }
  }
}
