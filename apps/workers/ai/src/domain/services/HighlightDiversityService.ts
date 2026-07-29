import type { HighlightSelection } from "../value-objects/HighlightSelection"

/** Pure — no I/O. Percentage of `candidate`'s duration that overlaps with `other`. */
export function calculateOverlapPercentage(
  candidate: HighlightSelection,
  other: HighlightSelection,
): number {
  const overlapStart = Math.max(candidate.startMs, other.startMs)
  const overlapEnd = Math.min(candidate.endMs, other.endMs)
  const overlapMs = Math.max(0, overlapEnd - overlapStart)
  const candidateDurationMs = candidate.endMs - candidate.startMs
  return (overlapMs / candidateDurationMs) * 100
}
