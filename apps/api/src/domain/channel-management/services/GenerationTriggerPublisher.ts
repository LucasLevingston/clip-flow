export interface GenerationTriggerEvent {
  channelId: string
  tenantId: string
}

/** Publishes the same `GenerationBatch` job the Scheduler Worker's own daily cron enqueues. */
export interface GenerationTriggerPublisher {
  publish(event: GenerationTriggerEvent): Promise<void>
}
