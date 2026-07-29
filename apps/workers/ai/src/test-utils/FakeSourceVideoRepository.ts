import type {
  SourceVideoRepository,
  SourceVideoSnapshot,
} from "../domain/repositories/SourceVideoRepository"

export class FakeSourceVideoRepository implements SourceVideoRepository {
  private readonly sourceVideosById = new Map<string, SourceVideoSnapshot>()

  seed(sourceVideo: SourceVideoSnapshot): void {
    this.sourceVideosById.set(sourceVideo.id, sourceVideo)
  }

  findById(sourceVideoId: string): Promise<SourceVideoSnapshot | null> {
    return Promise.resolve(this.sourceVideosById.get(sourceVideoId) ?? null)
  }
}
