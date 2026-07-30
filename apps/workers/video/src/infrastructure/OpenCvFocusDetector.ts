import { execFile } from "node:child_process"
import { OpenCvAnalysisError } from "../domain/errors/OpenCvAnalysisError"
import type { FrameFocusResult } from "../domain/types"
import type { FocusDetector } from "../domain/services/FocusDetector"

const MAX_BUFFER_BYTES = 10 * 1_024 * 1_024

/** Runs `scripts/analyze_frames.py` as a separate Python process (docs/integrations/opencv.md). */
export class OpenCvFocusDetector implements FocusDetector {
  constructor(
    private readonly pythonBinary: string,
    private readonly scriptPath: string,
    private readonly modelPath: string,
    private readonly timeoutMs: number,
  ) {}

  analyzeFrames(framePaths: string[]): Promise<FrameFocusResult[]> {
    if (framePaths.length === 0) {
      return Promise.resolve([])
    }
    return new Promise((resolve, reject) => {
      execFile(
        this.pythonBinary,
        [this.scriptPath, this.modelPath, ...framePaths],
        { timeout: this.timeoutMs, maxBuffer: MAX_BUFFER_BYTES },
        (error, stdout, stderr) => {
          if (error) {
            reject(new OpenCvAnalysisError(stderr || error.message))
            return
          }
          try {
            resolve(JSON.parse(stdout) as FrameFocusResult[])
          } catch {
            reject(new OpenCvAnalysisError("invalid JSON output"))
          }
        },
      )
    })
  }
}
