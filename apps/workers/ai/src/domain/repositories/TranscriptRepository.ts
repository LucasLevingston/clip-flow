import type { TranscriptSegment } from "../types"

export interface TranscriptRecord {
  id: string
  sourceVideoId: string
  segments: TranscriptSegment[]
  language: string
}

export interface CreateTranscriptInput {
  sourceVideoId: string
  segments: TranscriptSegment[]
  language: string
}

/** `Transcript` cache — one per `sourceVideoId`, shared across every channel that draws from it. */
export interface TranscriptRepository {
  findBySourceVideoId(sourceVideoId: string): Promise<TranscriptRecord | null>
  save(input: CreateTranscriptInput): Promise<TranscriptRecord>
}
