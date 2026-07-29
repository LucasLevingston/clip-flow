import type {
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionSourceVideo,
} from "../domain/services/TranscriptionProvider"

export class FakeTranscriptionProvider implements TranscriptionProvider {
  callCount = 0
  result: TranscriptionResult = {
    segments: [{ startMs: 0, endMs: 1_000, text: "hello" }],
    language: "pt-BR",
  }

  transcribe(_sourceVideo: TranscriptionSourceVideo): Promise<TranscriptionResult> {
    this.callCount += 1
    return Promise.resolve(this.result)
  }
}
