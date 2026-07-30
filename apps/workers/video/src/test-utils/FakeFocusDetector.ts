import type { FocusDetector } from "../domain/services/FocusDetector"
import type { FrameFocusResult } from "../domain/types"

export class FakeFocusDetector implements FocusDetector {
  resultToReturn: FrameFocusResult[] = [
    { framePath: "frame-1.jpg", faceCenterX: 960, faceCenterY: 540, sharpness: 50 },
    { framePath: "frame-2.jpg", faceCenterX: null, faceCenterY: null, sharpness: 80 },
  ]

  analyzeFrames(_framePaths: string[]): Promise<FrameFocusResult[]> {
    return Promise.resolve(this.resultToReturn)
  }
}
