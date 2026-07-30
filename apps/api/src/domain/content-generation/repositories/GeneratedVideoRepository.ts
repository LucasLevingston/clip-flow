import type { GeneratedVideoStatus } from "../types"

export interface FlaggedVideoSummary {
  id: string
  channelId: string
  flagReason: string | null
  createdAt: Date
}

export interface GeneratedVideoSnapshot {
  id: string
  channelId: string
  status: GeneratedVideoStatus
}

export interface PaginatedFlaggedVideos {
  items: FlaggedVideoSummary[]
  total: number
}

export interface GeneratedVideoRepository {
  findPendingModerationPaginated(input: {
    page: number
    pageSize: number
  }): Promise<PaginatedFlaggedVideos>
  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null>
  updateStatus(generatedVideoId: string, status: GeneratedVideoStatus): Promise<void>
}
