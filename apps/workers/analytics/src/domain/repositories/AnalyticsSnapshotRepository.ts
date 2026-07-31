import type { ChannelPerformanceRecord } from "../types"

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
  /** Latest snapshot per published video of the channel — see docs/architecture/analytics-flow.md. */
  findByChannelId(channelId: string): Promise<ChannelPerformanceRecord[]>
}
