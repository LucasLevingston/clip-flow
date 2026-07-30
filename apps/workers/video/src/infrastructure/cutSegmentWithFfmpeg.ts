import type { CutSegmentInput } from "../domain/services/VideoProcessingService"
import { runFfmpegCommand } from "./runFfmpegCommand"

/** Fast stream-copy cut (docs/integrations/ffmpeg.md) — final re-encode happens in encodeFinal. */
export async function cutSegmentWithFfmpeg(
  binary: string,
  timeoutMs: number,
  input: CutSegmentInput,
): Promise<void> {
  const startSec = input.startMs / 1_000
  const durationSec = (input.endMs - input.startMs) / 1_000
  await runFfmpegCommand(
    binary,
    [
      "-y",
      "-ss",
      String(startSec),
      "-i",
      input.sourceFilePath,
      "-t",
      String(durationSec),
      "-c",
      "copy",
      input.outputPath,
    ],
    timeoutMs,
  )
}
