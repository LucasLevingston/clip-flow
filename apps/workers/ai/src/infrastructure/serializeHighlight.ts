import type { HighlightSelection } from "../domain/value-objects/HighlightSelection"

export function serializeHighlight(highlight: HighlightSelection) {
  return {
    startMs: highlight.startMs,
    endMs: highlight.endMs,
    transcriptSegmentIds: highlight.transcriptSegmentIds,
  }
}
