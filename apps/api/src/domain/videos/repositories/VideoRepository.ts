import type { GeneratedVideoStatus, SocialPlatform, VideoCopy } from "../types"

export interface PublishRecordSummary {
  platform: SocialPlatform
  status: string
  externalPostId: string | null
  publishedAt: Date | null
}

export interface VideoSummary {
  id: string
  channelId: string
  status: GeneratedVideoStatus
  sourceVideoId: string
  thumbnailUrl: string | null
  finalAssetUrl: string | null
  scheduledPublishAt: Date
  createdAt: Date
  publishRecords: PublishRecordSummary[]
}

export interface LatestSnapshot {
  views: number
  likes: number
  comments: number
  shares: number
}

export interface PublishRecordWithLatestSnapshot extends PublishRecordSummary {
  latestSnapshot: LatestSnapshot | null
}

export interface VideoDetail {
  id: string
  channelId: string
  status: GeneratedVideoStatus
  highlight: unknown
  copy: VideoCopy | null
  thumbnailUrl: string | null
  finalAssetUrl: string | null
  scheduledPublishAt: Date
  createdAt: Date
  publishRecords: PublishRecordWithLatestSnapshot[]
}

export interface VideoFilters {
  channelId?: string | undefined
  platform?: SocialPlatform | undefined
  status?: GeneratedVideoStatus | undefined
  from?: Date | undefined
  to?: Date | undefined
}

export interface FindPaginatedVideosInput {
  tenantId: string
  page: number
  pageSize: number
  filters: VideoFilters
}

export interface PaginatedVideos {
  items: VideoSummary[]
  total: number
}

export interface VideoExportRow {
  id: string
  channel: string
  status: GeneratedVideoStatus
  platform: SocialPlatform
  publishedAt: Date | null
  views: number
  likes: number
  comments: number
}

export interface VideoRepository {
  findPaginatedByTenant(input: FindPaginatedVideosInput): Promise<PaginatedVideos>
  findById(tenantId: string, videoId: string): Promise<VideoDetail | null>
  findExportRows(tenantId: string, filters: VideoFilters): Promise<VideoExportRow[]>
  findActivePipelineByChannel(tenantId: string, channelId: string): Promise<VideoSummary[]>
}
