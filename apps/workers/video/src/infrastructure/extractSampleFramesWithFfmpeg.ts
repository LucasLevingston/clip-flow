import { mkdir } from "node:fs/promises"
import path from "node:path"
import type { SampleFramesInput } from "../domain/services/VideoProcessingService"
import { listFrameFiles } from "./listFrameFiles"
import { probeVideoDurationMs } from "./probeVideoDurationMs"
import { runFfmpegCommand } from "./runFfmpegCommand"

const MIN_INTERVAL_SEC = 0.5

export async function extractSampleFramesWithFfmpeg(
  ffmpegBinary: string,
  ffprobeBinary: string,
  timeoutMs: number,
  input: SampleFramesInput,
): Promise<string[]> {
  await mkdir(input.outputDir, { recursive: true })
  const durationMs = await probeVideoDurationMs(ffprobeBinary, timeoutMs, input.videoPath)
  const intervalSec = Math.max(MIN_INTERVAL_SEC, durationMs / 1_000 / input.count)
  const pattern = path.join(input.outputDir, "frame-%03d.jpg")

  await runFfmpegCommand(
    ffmpegBinary,
    ["-y", "-i", input.videoPath, "-vf", `fps=1/${intervalSec}`, "-vsync", "vfr", pattern],
    timeoutMs,
  )

  return listFrameFiles(input.outputDir, input.count)
}
