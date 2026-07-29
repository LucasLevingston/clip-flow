import type { Queue } from "bullmq"
import type {
  RegisterRepeatableJobInput,
  RepeatableJobRegistry,
} from "../domain/services/RepeatableJobRegistry"
import { buildDailyCronPattern } from "./buildDailyCronPattern"

/** One BullMQ Job Scheduler per Channel, keyed by `channelId` — idempotent upsert/remove. */
export class BullMqRepeatableJobRegistry implements RepeatableJobRegistry {
  constructor(private readonly queue: Queue) {}

  async register(input: RegisterRepeatableJobInput): Promise<void> {
    await this.queue.upsertJobScheduler(
      input.channelId,
      { pattern: buildDailyCronPattern(input.generationTime) },
      {
        name: "GenerationBatch",
        data: { channelId: input.channelId, tenantId: input.tenantId },
      },
    )
  }

  async remove(channelId: string): Promise<void> {
    await this.queue.removeJobScheduler(channelId)
  }
}
