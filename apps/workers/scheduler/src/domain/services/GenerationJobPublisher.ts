export interface GenerationScheduledJob {
  tenantId: string
  channelId: string
  batchRunId: string
  sourceVideoId: string
  generatedVideoId: string
  scheduledPublishAt: string
}

/** Produces onto the `ai` queue — consumed starting EPIC-06.F3. */
export interface GenerationJobPublisher {
  publish(job: GenerationScheduledJob): Promise<void>
}
