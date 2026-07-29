export interface RegisterRepeatableJobInput {
  channelId: string
  tenantId: string
  generationTime: string
}

/** Keeps the daily generation trigger in sync with a Channel's current config — see docs/workers/scheduler-worker.md. */
export interface RepeatableJobRegistry {
  register(input: RegisterRepeatableJobInput): Promise<void>
  remove(channelId: string): Promise<void>
}
