import type { TranscriptRecord } from "../repositories/TranscriptRepository"

export interface SourceVideoTranscriber {
  execute(sourceVideoId: string, generatedVideoId: string): Promise<TranscriptRecord>
}
