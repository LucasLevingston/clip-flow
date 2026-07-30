import type { GeneratedVideoStatus, HighlightWindow } from "../types"

export interface GeneratedVideoSnapshot {
  id: string
  channelId: string
  sourceVideoId: string
  status: GeneratedVideoStatus
  highlight: HighlightWindow | null
  scheduledPublishAt: Date
}

export interface GeneratedVideoUpdatePatch {
  status: GeneratedVideoStatus
  finalAssetUrl?: string
  thumbnailUrl?: string
  failureReason?: string
}

export interface GeneratedVideoRepository {
  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null>
  updateStatus(generatedVideoId: string, patch: GeneratedVideoUpdatePatch): Promise<void>
}
