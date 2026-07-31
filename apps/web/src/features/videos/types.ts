export type GeneratedVideoStatus =
  | "SOURCING"
  | "TRANSCRIBING"
  | "PENDING_MODERATION"
  | "CONTENT_READY"
  | "CUTTING"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "FAILED"
  | "REJECTED"

export type SocialPlatform = "YOUTUBE" | "TIKTOK"

export interface PublishRecordSummary {
  platform: SocialPlatform
  status: string
  externalPostId: string | null
  publishedAt: string | null
}

export interface VideoSummary {
  id: string
  channelId: string
  status: GeneratedVideoStatus
  sourceVideoId: string
  thumbnailUrl: string | null
  finalAssetUrl: string | null
  scheduledPublishAt: string
  createdAt: string
  publishRecords: PublishRecordSummary[]
}

export interface ListVideosResult {
  data: VideoSummary[]
  meta: { page: number; pageSize: number; total: number }
}

export interface VideoFilters {
  channelId?: string
  platform?: SocialPlatform
  status?: GeneratedVideoStatus
}
