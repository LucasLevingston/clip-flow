import type { CropRegion } from "../types"

const TARGET_ASPECT_RATIO = 9 / 16

/** Pure — no I/O. Falls back to a centered crop when no face was detected (not an error). */
export function calculateDynamicCrop(
  focusCenter: { x: number; y: number } | null,
  videoWidth: number,
  videoHeight: number,
): CropRegion {
  const cropWidth = Math.min(videoWidth, Math.round(videoHeight * TARGET_ASPECT_RATIO))
  const centerX = focusCenter?.x ?? videoWidth / 2
  const maxX = videoWidth - cropWidth
  const x = Math.max(0, Math.min(Math.round(centerX - cropWidth / 2), maxX))
  return { x, y: 0, width: cropWidth, height: videoHeight }
}
