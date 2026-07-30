import type { FrameFocusResult } from "../types"

/** Pure — no network I/O. Reuses the sharpness already computed by FocusDetector (ADR-0013). */
export function selectBestThumbnailFrame(
  frames: FrameFocusResult[],
  thumbnailEnabled: boolean,
): string | null {
  if (!thumbnailEnabled || frames.length === 0) {
    return null
  }
  return frames.reduce((sharpest, frame) =>
    frame.sharpness > sharpest.sharpness ? frame : sharpest,
  ).framePath
}
