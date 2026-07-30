export type GeneratedVideoStatus =
  | "SOURCING"
  | "TRANSCRIBING"
  | "PENDING_MODERATION"
  | "CONTENT_READY"
  | "CUTTING"
  | "READY_TO_PUBLISH"
  | "PUBLISHED"
  | "FAILED"
  | "REJECTED"

export interface HighlightWindow {
  startMs: number
  endMs: number
}

export interface TranscriptSegment {
  startMs: number
  endMs: number
  text: string
}

export interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface FrameFocusResult {
  framePath: string
  faceCenterX: number | null
  faceCenterY: number | null
  sharpness: number
}
