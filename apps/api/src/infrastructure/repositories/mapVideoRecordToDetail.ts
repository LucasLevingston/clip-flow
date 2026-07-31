import type { VideoDetail } from "../../domain/videos/repositories/VideoRepository"
import type { VideoCopy } from "../../domain/videos/types"

interface RawPublishRecord {
  platform: "YOUTUBE" | "TIKTOK"
  status: string
  externalPostId: string | null
  publishedAt: Date | null
  analyticsSnapshots: { views: number; likes: number; comments: number; shares: number }[]
}

export interface RawVideoDetailRecord {
  id: string
  channelId: string
  status: VideoDetail["status"]
  highlight: unknown
  copy: unknown
  thumbnailUrl: string | null
  finalAssetUrl: string | null
  scheduledPublishAt: Date
  createdAt: Date
  publishRecords: RawPublishRecord[]
}

export function mapVideoRecordToDetail(record: RawVideoDetailRecord): VideoDetail {
  return {
    id: record.id,
    channelId: record.channelId,
    status: record.status,
    highlight: record.highlight,
    copy: record.copy as VideoCopy | null,
    thumbnailUrl: record.thumbnailUrl,
    finalAssetUrl: record.finalAssetUrl,
    scheduledPublishAt: record.scheduledPublishAt,
    createdAt: record.createdAt,
    publishRecords: record.publishRecords.map((publishRecord) => {
      const snapshot = publishRecord.analyticsSnapshots[0]
      return {
        platform: publishRecord.platform,
        status: publishRecord.status,
        externalPostId: publishRecord.externalPostId,
        publishedAt: publishRecord.publishedAt,
        latestSnapshot: snapshot
          ? {
              views: snapshot.views,
              likes: snapshot.likes,
              comments: snapshot.comments,
              shares: snapshot.shares,
            }
          : null,
      }
    }),
  }
}
