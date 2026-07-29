import type {
  CreateTranscriptInput,
  TranscriptRecord,
  TranscriptRepository,
} from "../domain/repositories/TranscriptRepository"

export class FakeTranscriptRepository implements TranscriptRepository {
  private readonly transcriptsBySourceVideoId = new Map<string, TranscriptRecord>()

  seed(record: TranscriptRecord): void {
    this.transcriptsBySourceVideoId.set(record.sourceVideoId, record)
  }

  findBySourceVideoId(sourceVideoId: string): Promise<TranscriptRecord | null> {
    return Promise.resolve(this.transcriptsBySourceVideoId.get(sourceVideoId) ?? null)
  }

  save(input: CreateTranscriptInput): Promise<TranscriptRecord> {
    const record: TranscriptRecord = { id: `transcript-${input.sourceVideoId}`, ...input }
    this.transcriptsBySourceVideoId.set(input.sourceVideoId, record)
    return Promise.resolve(record)
  }
}
