import type { TranscriptSegment } from "../types"

export interface TranscriptionSourceVideo {
  id: string
  storageUrl: string
}

export interface TranscriptionResult {
  segments: TranscriptSegment[]
  language: string
}

export interface TranscriptionProvider {
  transcribe(sourceVideo: TranscriptionSourceVideo): Promise<TranscriptionResult>
}
