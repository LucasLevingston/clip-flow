import type { VideoExportRow } from "../../domain/videos/repositories/VideoRepository"

export interface RawExportPublishRecord {
  generatedVideoId: string
  platform: "YOUTUBE" | "TIKTOK"
  publishedAt: Date | null
  generatedVideo: { status: VideoExportRow["status"]; channel: { name: string } }
  analyticsSnapshots: { views: number; likes: number; comments: number }[]
}

export function mapPublishRecordToExportRow(record: RawExportPublishRecord): VideoExportRow {
  const snapshot = record.analyticsSnapshots[0]
  return {
    id: record.generatedVideoId,
    channel: record.generatedVideo.channel.name,
    status: record.generatedVideo.status,
    platform: record.platform,
    publishedAt: record.publishedAt,
    views: snapshot?.views ?? 0,
    likes: snapshot?.likes ?? 0,
    comments: snapshot?.comments ?? 0,
  }
}
