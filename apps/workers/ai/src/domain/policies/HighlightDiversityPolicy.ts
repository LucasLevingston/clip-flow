import { calculateOverlapPercentage } from "../services/HighlightDiversityService"
import type { HighlightSelection } from "../value-objects/HighlightSelection"

const MAX_OVERLAP_PERCENTAGE = 40

/** ADR-0006 (R-04) — rejects a highlight too similar to ones already used by other channels for the same source video. */
export function isDiverseEnough(
  candidate: HighlightSelection,
  usedByOtherChannels: HighlightSelection[],
): boolean {
  return usedByOtherChannels.every(
    (used) => calculateOverlapPercentage(candidate, used) <= MAX_OVERLAP_PERCENTAGE,
  )
}
