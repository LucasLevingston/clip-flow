import type { TranscriptRecord } from "../domain/repositories/TranscriptRepository"
import type { SourceVideoTranscriber } from "../domain/services/SourceVideoTranscriber"

export class FakeSourceVideoTranscriber implements SourceVideoTranscriber {
  result: TranscriptRecord = {
    id: "transcript-1",
    sourceVideoId: "source-1",
    segments: [{ startMs: 0, endMs: 20_000, text: "hello" }],
    language: "pt-BR",
  }
  errorToThrow: Error | null = null

  execute(_sourceVideoId: string, _generatedVideoId: string): Promise<TranscriptRecord> {
    if (this.errorToThrow) {
      return Promise.reject(this.errorToThrow)
    }
    return Promise.resolve(this.result)
  }
}
