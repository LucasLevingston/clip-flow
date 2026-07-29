import type { PlanRepository } from "../../../domain/billing/repositories/PlanRepository"
import type { SubscriptionRepository } from "../../../domain/billing/repositories/SubscriptionRepository"
import type { ChannelUsageProvider } from "../../../domain/billing/repositories/ChannelUsageProvider"
import { NicheInactiveError } from "../../../domain/channel-management/errors/NicheInactiveError"
import type { ChannelFactory } from "../../../domain/channel-management/factories/ChannelFactory"
import type { ChannelRepository } from "../../../domain/channel-management/repositories/ChannelRepository"
import type { ChannelPlatforms } from "../../../domain/channel-management/entities/Channel"
import type { ChannelScheduleEventPublisher } from "../../../domain/channel-management/services/ChannelScheduleEventPublisher"
import { TimeOfDay } from "../../../domain/channel-management/value-objects/TimeOfDay"
import type { NicheRepository } from "../../../domain/catalog/repositories/NicheRepository"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import { type ChannelDto, mapChannelToDto } from "./mapChannelToDto"
import { publishChannelScheduleEvent } from "./publishChannelScheduleEvent"

export interface CreateChannelInput {
  tenantId: string
  nicheId: string
  name: string
  language: string
  promptOverride: string | null
  videosPerDay: number
  publishTimes: string[] | null
  generationTime: string
  platforms: ChannelPlatforms
  thumbnailEnabled: boolean
}

export interface CreateChannelUseCaseDeps {
  nicheRepository: NicheRepository
  subscriptionRepository: SubscriptionRepository
  planRepository: PlanRepository
  channelUsageProvider: ChannelUsageProvider
  channelFactory: ChannelFactory
  channelRepository: ChannelRepository
  idGenerator: IdGenerator
  channelScheduleEventPublisher: ChannelScheduleEventPublisher
}

/** RF-04/RF-06 — `POST /v1/channels`. */
export class CreateChannelUseCase {
  constructor(private readonly deps: CreateChannelUseCaseDeps) {}

  async execute(input: CreateChannelInput): Promise<ChannelDto> {
    const niche = await this.deps.nicheRepository.findActiveById(input.nicheId)
    if (!niche) {
      throw new NicheInactiveError(input.nicheId)
    }

    const subscription = await this.deps.subscriptionRepository.findByTenantId(input.tenantId)
    if (!subscription) {
      throw new Error(`Tenant "${input.tenantId}" has no subscription`)
    }
    const plan = await this.deps.planRepository.findById(subscription.planId)
    if (!plan) {
      throw new Error(`Subscription references unknown plan "${subscription.planId}"`)
    }

    const currentChannelCount = await this.deps.channelUsageProvider.countByTenant(input.tenantId)

    const channel = this.deps.channelFactory.create({
      id: this.deps.idGenerator.generate(),
      tenantId: input.tenantId,
      nicheId: input.nicheId,
      name: input.name,
      language: input.language,
      promptOverride: input.promptOverride,
      videosPerDay: input.videosPerDay,
      publishTimes: input.publishTimes?.map((time) => TimeOfDay.parse(time)) ?? null,
      generationTime: TimeOfDay.parse(input.generationTime),
      platforms: input.platforms,
      thumbnailEnabled: input.thumbnailEnabled,
      plan,
      currentChannelCount,
    })

    await this.deps.channelRepository.save(channel)
    await publishChannelScheduleEvent(channel, this.deps.channelScheduleEventPublisher)
    return mapChannelToDto(channel)
  }
}
