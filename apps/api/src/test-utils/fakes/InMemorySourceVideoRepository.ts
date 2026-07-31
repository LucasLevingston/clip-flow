import type { SourceVideo } from "../../domain/catalog/entities/SourceVideo"
import type {
  SourceVideoListFilter,
  SourceVideoListResult,
  SourceVideoRepository,
} from "../../domain/catalog/repositories/SourceVideoRepository"

export class InMemorySourceVideoRepository implements SourceVideoRepository {
  private readonly sourceVideosById = new Map<string, SourceVideo>()

  seed(sourceVideo: SourceVideo): void {
    this.sourceVideosById.set(sourceVideo.id, sourceVideo)
  }

  findById(id: string): Promise<SourceVideo | null> {
    return Promise.resolve(this.sourceVideosById.get(id) ?? null)
  }

  findPaginated(filter: SourceVideoListFilter): Promise<SourceVideoListResult> {
    const matching = [...this.sourceVideosById.values()]
      .filter((sourceVideo) => !filter.status || sourceVideo.status === filter.status)
      .filter((sourceVideo) => !filter.nicheId || sourceVideo.nicheId === filter.nicheId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const start = (filter.page - 1) * filter.pageSize
    return Promise.resolve({
      items: matching.slice(start, start + filter.pageSize),
      total: matching.length,
    })
  }

  save(sourceVideo: SourceVideo): Promise<void> {
    this.sourceVideosById.set(sourceVideo.id, sourceVideo)
    return Promise.resolve()
  }
}
