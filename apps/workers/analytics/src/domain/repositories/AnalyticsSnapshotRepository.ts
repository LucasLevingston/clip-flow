export interface CreateAnalyticsSnapshotInput {
  publishRecordId: string
  views: number
  likes: number
  comments: number
  shares: number
  retentionRate: number
  ctr: number
}

export interface AnalyticsSnapshotRepository {
  create(input: CreateAnalyticsSnapshotInput): Promise<void>
}
