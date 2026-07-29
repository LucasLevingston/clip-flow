import type { AlertPublisher } from "../../domain/services/AlertPublisher"
import { buildBatchRunId } from "../../domain/services/buildBatchRunId"
import type { Clock } from "../../domain/services/Clock"
import type { GenerationJobPublisher } from "../../domain/services/GenerationJobPublisher"
import { IsChannelActiveSpecification } from "../../domain/specifications/IsChannelActiveSpecification"
import { IsChannelReadyToPublishSpecification } from "../../domain/specifications/IsChannelReadyToPublishSpecification"
import { IsSubscriptionActiveSpecification } from "../../domain/specifications/IsSubscriptionActiveSpecification"
import type { ChannelReadRepository } from "../../domain/repositories/ChannelReadRepository"
import type { GeneratedVideoRepository } from "../../domain/repositories/GeneratedVideoRepository"
import type { SocialAccountReadRepository } from "../../domain/repositories/SocialAccountReadRepository"
import type { SourceVideoPoolRepository } from "../../domain/repositories/SourceVideoPoolRepository"
import type { SubscriptionReadRepository } from "../../domain/repositories/SubscriptionReadRepository"
import { generateScheduledVideos } from "./generateScheduledVideos"

export interface TriggerDailyGenerationInput {
  channelId: string
  tenantId: string
}

export interface TriggerDailyGenerationUseCaseDeps {
  channelReadRepository: ChannelReadRepository
  subscriptionReadRepository: SubscriptionReadRepository
  socialAccountReadRepository: SocialAccountReadRepository
  sourceVideoPoolRepository: SourceVideoPoolRepository
  generatedVideoRepository: GeneratedVideoRepository
  generationJobPublisher: GenerationJobPublisher
  alertPublisher: AlertPublisher
  clock: Clock
  isSubscriptionActiveSpecification?: IsSubscriptionActiveSpecification
  isChannelActiveSpecification?: IsChannelActiveSpecification
  isChannelReadyToPublishSpecification?: IsChannelReadyToPublishSpecification
}

/** ISSUE-06.F2.S1.T2 — the daily repeatable job's payload. See docs/architecture/scheduler-flow.md. */
export class TriggerDailyGenerationUseCase {
  private readonly isSubscriptionActive: IsSubscriptionActiveSpecification
  private readonly isChannelActive: IsChannelActiveSpecification
  private readonly isChannelReady: IsChannelReadyToPublishSpecification

  constructor(private readonly deps: TriggerDailyGenerationUseCaseDeps) {
    this.isSubscriptionActive =
      deps.isSubscriptionActiveSpecification ?? new IsSubscriptionActiveSpecification()
    this.isChannelActive = deps.isChannelActiveSpecification ?? new IsChannelActiveSpecification()
    this.isChannelReady =
      deps.isChannelReadyToPublishSpecification ?? new IsChannelReadyToPublishSpecification()
  }

  async execute(input: TriggerDailyGenerationInput): Promise<void> {
    const channel = await this.deps.channelReadRepository.findById(input.channelId)
    if (!channel || !this.isChannelActive.isSatisfiedBy(channel.status)) {
      return
    }

    const subscriptionStatus = await this.deps.subscriptionReadRepository.findStatusByTenantId(
      channel.tenantId,
    )
    if (!subscriptionStatus || !this.isSubscriptionActive.isSatisfiedBy(subscriptionStatus)) {
      return
    }

    const connectedPlatforms =
      await this.deps.socialAccountReadRepository.findConnectedPlatformsByChannelId(channel.id)
    if (!this.isChannelReady.isSatisfiedBy(channel.platforms, connectedPlatforms)) {
      return
    }

    const now = this.deps.clock.now()
    const batchRunId = buildBatchRunId(channel.id, now)
    if (await this.deps.generatedVideoRepository.existsForBatch(channel.id, batchRunId)) {
      return
    }

    await generateScheduledVideos(channel, batchRunId, now, this.deps)
  }
}
