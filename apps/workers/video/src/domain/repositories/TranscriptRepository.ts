import type { TranscriptSegment } from "../types"

export interface TranscriptSnapshot {
  segments: TranscriptSegment[]
}

export interface TranscriptRepository {
  findBySourceVideoId(sourceVideoId: string): Promise<TranscriptSnapshot | null>
}
