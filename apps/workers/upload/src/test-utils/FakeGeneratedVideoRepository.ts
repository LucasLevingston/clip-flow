import type {
  GeneratedVideoRepository,
  GeneratedVideoSnapshot,
} from "../domain/repositories/GeneratedVideoRepository"

export class FakeGeneratedVideoRepository implements GeneratedVideoRepository {
  private readonly videosById = new Map<string, GeneratedVideoSnapshot>()
  readonly publishedIds: string[] = []

  seed(video: GeneratedVideoSnapshot): void {
    this.videosById.set(video.id, video)
  }

  findById(generatedVideoId: string): Promise<GeneratedVideoSnapshot | null> {
    return Promise.resolve(this.videosById.get(generatedVideoId) ?? null)
  }

  markPublished(generatedVideoId: string): Promise<void> {
    this.publishedIds.push(generatedVideoId)
    return Promise.resolve()
  }
}
