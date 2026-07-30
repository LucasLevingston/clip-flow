import type { FrameFocusResult } from "../types"

/** OpenCV, run as a separate Python process — never called directly from application/domain code (DIP). */
export interface FocusDetector {
  analyzeFrames(framePaths: string[]): Promise<FrameFocusResult[]>
}
