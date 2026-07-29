export interface CreateGeneratedVideoInput {
  tenantId: string
  channelId: string
  sourceVideoId: string
  batchRunId: string
  scheduledPublishAt: Date
}

export interface GeneratedVideoRepository {
  existsForBatch(channelId: string, batchRunId: string): Promise<boolean>
  create(input: CreateGeneratedVideoInput): Promise<{ id: string }>
}
