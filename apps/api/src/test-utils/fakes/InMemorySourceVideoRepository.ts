import type { SourceVideo } from "../../domain/catalog/entities/SourceVideo"
import type { SourceVideoRepository } from "../../domain/catalog/repositories/SourceVideoRepository"

export class InMemorySourceVideoRepository implements SourceVideoRepository {
  private readonly sourceVideosById = new Map<string, SourceVideo>()

  seed(sourceVideo: SourceVideo): void {
    this.sourceVideosById.set(sourceVideo.id, sourceVideo)
  }

  findById(id: string): Promise<SourceVideo | null> {
    return Promise.resolve(this.sourceVideosById.get(id) ?? null)
  }

  save(sourceVideo: SourceVideo): Promise<void> {
    this.sourceVideosById.set(sourceVideo.id, sourceVideo)
    return Promise.resolve()
  }
}
