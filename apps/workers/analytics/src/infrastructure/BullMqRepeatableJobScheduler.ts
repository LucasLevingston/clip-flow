import type { Queue } from "bullmq"
import type { RepeatableJobScheduler } from "../domain/services/RepeatableJobScheduler"

export class BullMqRepeatableJobScheduler implements RepeatableJobScheduler {
  constructor(private readonly queue: Queue) {}

  async upsertRepeatable(
    schedulerId: string,
    everyMs: number,
    jobName: string,
    data: unknown,
  ): Promise<void> {
    await this.queue.upsertJobScheduler(schedulerId, { every: everyMs }, { name: jobName, data })
  }

  async removeRepeatable(schedulerId: string): Promise<void> {
    await this.queue.removeJobScheduler(schedulerId)
  }
}
