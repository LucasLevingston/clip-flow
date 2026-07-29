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

export type PromptTemplateType = "HIGHLIGHT_SELECTION" | "COPY_GENERATION"

export interface TranscriptSegment {
  startMs: number
  endMs: number
  text: string
}

export interface ChannelInsightsSnapshot {
  bestPublishHours: unknown
  topTitlePatterns: unknown
  topHashtags: unknown
  avgOptimalDurationMs: number
}
