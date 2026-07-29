import { SourceVideoNotFoundError } from "../../domain/errors/SourceVideoNotFoundError"
import type { SourceVideoRepository } from "../../domain/repositories/SourceVideoRepository"
import type {
  TranscriptRecord,
  TranscriptRepository,
} from "../../domain/repositories/TranscriptRepository"
import type { AiCostRecorder } from "../../domain/services/AiCostRecorder"
import type { SourceVideoTranscriber } from "../../domain/services/SourceVideoTranscriber"
import type { TranscriptionProvider } from "../../domain/services/TranscriptionProvider"

export interface TranscribeSourceVideoDeps {
  sourceVideoRepository: SourceVideoRepository
  transcriptRepository: TranscriptRepository
  transcriptionProvider: TranscriptionProvider
  costRecorder: AiCostRecorder
}

/** Cache-or-transcribe — a second call for the same sourceVideoId never invokes Whisper again. */
export class TranscribeSourceVideoUseCase implements SourceVideoTranscriber {
  constructor(private readonly deps: TranscribeSourceVideoDeps) {}

  async execute(sourceVideoId: string, generatedVideoId: string): Promise<TranscriptRecord> {
    const cached = await this.deps.transcriptRepository.findBySourceVideoId(sourceVideoId)
    if (cached) {
      return cached
    }

    const sourceVideo = await this.deps.sourceVideoRepository.findById(sourceVideoId)
    if (!sourceVideo) {
      throw new SourceVideoNotFoundError(sourceVideoId)
    }

    const result = await this.deps.transcriptionProvider.transcribe({
      id: sourceVideo.id,
      storageUrl: sourceVideo.storageUrl,
    })
    this.deps.costRecorder.record({
      generatedVideoId,
      provider: "WHISPER",
      task: "transcribe",
      audioMinutes: sourceVideo.durationSeconds / 60,
    })

    return this.deps.transcriptRepository.save({
      sourceVideoId,
      segments: result.segments,
      language: result.language,
    })
  }
}
