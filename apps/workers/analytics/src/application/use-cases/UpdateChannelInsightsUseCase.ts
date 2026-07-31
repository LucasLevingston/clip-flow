import { computeChannelInsights } from "../../domain/services/ChannelLearningService"
import { HasSufficientHistoryForInsightsSpecification } from "../../domain/specifications/HasSufficientHistoryForInsightsSpecification"
import type { AnalyticsSnapshotRepository } from "../../domain/repositories/AnalyticsSnapshotRepository"
import type { ChannelInsightsRepository } from "../../domain/repositories/ChannelInsightsRepository"
import type { Clock } from "../../domain/services/Clock"

export interface UpdateChannelInsightsInput {
  channelId: string
}

export interface UpdateChannelInsightsUseCaseDeps {
  analyticsSnapshotRepository: AnalyticsSnapshotRepository
  channelInsightsRepository: ChannelInsightsRepository
  clock: Clock
  hasSufficientHistorySpecification?: HasSufficientHistoryForInsightsSpecification
}

/**
 * Daily, before the channel's `generationTime` — RF-17. A channel without enough
 * history simply doesn't get ChannelInsights produced this cycle; that's the
 * normal state for a new channel, not an error (docs/architecture/analytics-flow.md).
 */
export class UpdateChannelInsightsUseCase {
  private readonly hasSufficientHistorySpecification: HasSufficientHistoryForInsightsSpecification

  constructor(private readonly deps: UpdateChannelInsightsUseCaseDeps) {
    this.hasSufficientHistorySpecification =
      deps.hasSufficientHistorySpecification ?? new HasSufficientHistoryForInsightsSpecification()
  }

  async execute(input: UpdateChannelInsightsInput): Promise<void> {
    const records = await this.deps.analyticsSnapshotRepository.findByChannelId(input.channelId)
    if (!this.hasSufficientHistorySpecification.isSatisfiedBy(records.length)) {
      return
    }

    const insights = computeChannelInsights(records)
    await this.deps.channelInsightsRepository.upsert({
      channelId: input.channelId,
      computedAt: this.deps.clock.now(),
      ...insights,
    })
  }
}
