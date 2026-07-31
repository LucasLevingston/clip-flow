import type { InsightsJobScheduler } from "../../domain/services/InsightsJobScheduler"

export type ChannelScheduleJobName = "RegisterChannelJob" | "RemoveChannelJob"

export interface SyncChannelInsightsScheduleInput {
  jobName: ChannelScheduleJobName
  channelId: string
  generationTime?: string | undefined
}

export interface SyncChannelInsightsScheduleUseCaseDeps {
  insightsJobScheduler: InsightsJobScheduler
}

/** Keeps the daily ChannelInsights recalculation job in sync with the channel's lifecycle. */
export class SyncChannelInsightsScheduleUseCase {
  constructor(private readonly deps: SyncChannelInsightsScheduleUseCaseDeps) {}

  async execute(input: SyncChannelInsightsScheduleInput): Promise<void> {
    if (input.jobName === "RemoveChannelJob") {
      await this.deps.insightsJobScheduler.remove(input.channelId)
      return
    }

    if (!input.generationTime) {
      throw new Error("RegisterChannelJob requires generationTime")
    }
    await this.deps.insightsJobScheduler.register({
      channelId: input.channelId,
      generationTime: input.generationTime,
    })
  }
}
