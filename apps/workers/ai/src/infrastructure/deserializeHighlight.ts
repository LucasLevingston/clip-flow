import { HighlightSelection } from "../domain/value-objects/HighlightSelection"

interface SerializedHighlight {
  startMs: number
  endMs: number
  transcriptSegmentIds: string[]
}

export function deserializeHighlight(value: unknown): HighlightSelection {
  const serialized = value as SerializedHighlight
  return HighlightSelection.create(
    serialized.startMs,
    serialized.endMs,
    serialized.transcriptSegmentIds,
  )
}
