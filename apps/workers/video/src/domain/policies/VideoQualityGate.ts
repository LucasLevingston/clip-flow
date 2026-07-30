const MIN_DURATION_MS = 15_000
const MAX_DURATION_MS = 90_000

export interface VideoQualityInput {
  durationMs: number
  hasSubtitles: boolean
}

/** Minimum quality bar before a GeneratedVideo may become READY_TO_PUBLISH (R-03). */
export function isAcceptableQuality(input: VideoQualityInput): boolean {
  return (
    input.durationMs >= MIN_DURATION_MS && input.durationMs <= MAX_DURATION_MS && input.hasSubtitles
  )
}
