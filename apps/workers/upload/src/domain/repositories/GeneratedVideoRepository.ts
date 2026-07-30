import type { VideoCopy } from "../types"

export interface GeneratedVideoSnapshot {
  id: string
  channelId: string
  finalAssetUrl: string | null
  copy: VideoCopy | null
}

export interface GeneratedVideoRepository {
  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null>
  markPublished(generatedVideoId: string): Promise<void>
}
