import OpenAI, { toFile } from "openai"
import type {
  TranscriptionProvider,
  TranscriptionResult,
  TranscriptionSourceVideo,
} from "../domain/services/TranscriptionProvider"

const TRANSCRIPTION_TIMEOUT_MS = 5 * 60 * 1000
const WHISPER_MODEL = "whisper-1"

/** Whisper via the OpenAI API — see docs/integrations/whisper.md. */
export class WhisperAdapter implements TranscriptionProvider {
  constructor(private readonly client: OpenAI) {}

  async transcribe(sourceVideo: TranscriptionSourceVideo): Promise<TranscriptionResult> {
    const response = await fetch(sourceVideo.storageUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    const file = await toFile(buffer, "source-video.mp4")

    const transcription = await this.client.audio.transcriptions.create(
      { file, model: WHISPER_MODEL, response_format: "verbose_json" },
      { timeout: TRANSCRIPTION_TIMEOUT_MS },
    )

    return {
      language: transcription.language,
      segments: (transcription.segments ?? []).map((segment) => ({
        startMs: Math.round(segment.start * 1000),
        endMs: Math.round(segment.end * 1000),
        text: segment.text,
      })),
    }
  }
}
