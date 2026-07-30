import type {
  FlaggedVideoSummary,
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
  PaginatedFlaggedVideos,
} from "../../domain/content-generation/repositories/GeneratedVideoRepository"
import type { GeneratedVideoStatus } from "../../domain/content-generation/types"

interface StoredVideo extends GeneratedVideoSnapshot {
  flagReason: string | null
  createdAt: Date
}

export class InMemoryGeneratedVideoRepository implements GeneratedVideoRepository {
  private readonly videosById = new Map<string, StoredVideo>()

  seed(video: StoredVideo): void {
    this.videosById.set(video.id, video)
  }

  findPendingModerationPaginated(input: {
    page: number
    pageSize: number
  }): Promise<PaginatedFlaggedVideos> {
    const pending = [...this.videosById.values()].filter((v) => v.status === "PENDING_MODERATION")
    const start = (input.page - 1) * input.pageSize
    const items: FlaggedVideoSummary[] = pending.slice(start, start + input.pageSize).map((v) => ({
      id: v.id,
      channelId: v.channelId,
      flagReason: v.flagReason,
      createdAt: v.createdAt,
    }))
    return Promise.resolve({ items, total: pending.length })
  }

  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    return Promise.resolve(this.videosById.get(generatedVideoId) ?? null)
  }

  updateStatus(generatedVideoId: string, status: GeneratedVideoStatus): Promise<void> {
    const existing = this.videosById.get(generatedVideoId)
    if (existing) {
      this.videosById.set(generatedVideoId, { ...existing, status })
    }
    return Promise.resolve()
  }
}
