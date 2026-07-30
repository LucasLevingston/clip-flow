import type { RepeatableJobScheduler } from "../domain/services/RepeatableJobScheduler"

export class FakeRepeatableJobScheduler implements RepeatableJobScheduler {
  readonly upserted: { schedulerId: string; everyMs: number; jobName: string; data: unknown }[] = []
  readonly removed: string[] = []

  upsertRepeatable(
    schedulerId: string,
    everyMs: number,
    jobName: string,
    data: unknown,
  ): Promise<void> {
    this.upserted.push({ schedulerId, everyMs, jobName, data })
    return Promise.resolve()
  }

  removeRepeatable(schedulerId: string): Promise<void> {
    this.removed.push(schedulerId)
    return Promise.resolve()
  }
}
