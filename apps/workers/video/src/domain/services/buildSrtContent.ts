import type { HighlightWindow, TranscriptSegment } from "../types"
import { formatSrtTimestamp } from "./formatSrtTimestamp"

/** Pure — no I/O. Rebases segment timestamps to the cut's own timeline (0 = highlight.startMs). */
export function buildSrtContent(segments: TranscriptSegment[], highlight: HighlightWindow): string {
  const relevant = segments.filter(
    (segment) => segment.startMs < highlight.endMs && segment.endMs > highlight.startMs,
  )
  return relevant
    .map((segment, index) => {
      const startMs = Math.max(0, segment.startMs - highlight.startMs)
      const endMs = Math.min(highlight.endMs - highlight.startMs, segment.endMs - highlight.startMs)
      return `${index + 1}\n${formatSrtTimestamp(startMs)} --> ${formatSrtTimestamp(endMs)}\n${segment.text}\n`
    })
    .join("\n")
}
