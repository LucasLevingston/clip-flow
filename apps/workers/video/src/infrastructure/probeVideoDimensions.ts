import type { VideoDimensions } from "../domain/services/VideoProcessingService"
import { runFfmpegCommand } from "./runFfmpegCommand"

export async function probeVideoDimensions(
  ffprobeBinary: string,
  timeoutMs: number,
  videoPath: string,
): Promise<VideoDimensions> {
  const stdout = await runFfmpegCommand(
    ffprobeBinary,
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=s=x:p=0",
      videoPath,
    ],
    timeoutMs,
  )
  const [width, height] = stdout.trim().split("x").map(Number)
  return { width: width ?? 0, height: height ?? 0 }
}
