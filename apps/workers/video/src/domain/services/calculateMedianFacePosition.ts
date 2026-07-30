import type { FrameFocusResult } from "../types"

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const middle = sorted[mid] ?? 0
  const lowerMiddle = sorted[mid - 1] ?? middle
  return sorted.length % 2 === 0 ? (lowerMiddle + middle) / 2 : middle
}

/** Pure — no I/O. Smooths noise across sampled frames; null when no face was detected in any frame. */
export function calculateMedianFacePosition(
  frames: FrameFocusResult[],
): { x: number; y: number } | null {
  const withFace = frames.filter(
    (frame): frame is FrameFocusResult & { faceCenterX: number; faceCenterY: number } =>
      frame.faceCenterX !== null && frame.faceCenterY !== null,
  )
  if (withFace.length === 0) {
    return null
  }
  return {
    x: median(withFace.map((frame) => frame.faceCenterX)),
    y: median(withFace.map((frame) => frame.faceCenterY)),
  }
}
