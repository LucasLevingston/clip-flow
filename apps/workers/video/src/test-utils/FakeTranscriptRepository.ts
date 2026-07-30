import type {
  TranscriptRepository,
  TranscriptSnapshot,
} from "../domain/repositories/TranscriptRepository"

export class FakeTranscriptRepository implements TranscriptRepository {
  private readonly transcriptsBySourceVideoId = new Map<string, TranscriptSnapshot>()

  seed(sourceVideoId: string, transcript: TranscriptSnapshot): void {
    this.transcriptsBySourceVideoId.set(sourceVideoId, transcript)
  }

  findBySourceVideoId(sourceVideoId: string): Promise<TranscriptSnapshot | null> {
    return Promise.resolve(this.transcriptsBySourceVideoId.get(sourceVideoId) ?? null)
  }
}
