import type { Queue } from "bullmq"
import { buildInsightsCronPattern } from "../domain/services/buildInsightsCronPattern"
import type {
  InsightsJobScheduler,
  RegisterInsightsJobInput,
} from "../domain/services/InsightsJobScheduler"

function schedulerId(channelId: string): string {
  return `channel-insights:${channelId}`
}

export class BullMqInsightsJobScheduler implements InsightsJobScheduler {
  constructor(private readonly queue: Queue) {}

  async register(input: RegisterInsightsJobInput): Promise<void> {
    await this.queue.upsertJobScheduler(
      schedulerId(input.channelId),
      { pattern: buildInsightsCronPattern(input.generationTime) },
      { name: "UpdateChannelInsights", data: { channelId: input.channelId } },
    )
  }

  async remove(channelId: string): Promise<void> {
    await this.queue.removeJobScheduler(schedulerId(channelId))
  }
}
