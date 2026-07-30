import { runFfmpegCommand } from "./runFfmpegCommand"

export async function probeVideoDurationMs(
  ffprobeBinary: string,
  timeoutMs: number,
  videoPath: string,
): Promise<number> {
  const stdout = await runFfmpegCommand(
    ffprobeBinary,
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ],
    timeoutMs,
  )
  return Math.round(Number(stdout.trim()) * 1_000)
}
