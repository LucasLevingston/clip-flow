export interface RepeatableJobScheduler {
  upsertRepeatable(
    schedulerId: string,
    everyMs: number,
    jobName: string,
    data: unknown,
  ): Promise<void>
  removeRepeatable(schedulerId: string): Promise<void>
}
