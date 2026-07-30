import { writeFile } from "node:fs/promises"
import type { EncodeFinalInput } from "../domain/services/VideoProcessingService"
import { escapeFfmpegFilterPath } from "./escapeFfmpegFilterPath"
import { runFfmpegCommand } from "./runFfmpegCommand"

export async function encodeFinalWithFfmpeg(
  ffmpegBinary: string,
  timeoutMs: number,
  input: EncodeFinalInput,
): Promise<void> {
  const filters = [`crop=${input.crop.width}:${input.crop.height}:${input.crop.x}:${input.crop.y}`]

  if (input.subtitlesContent) {
    const srtPath = `${input.outputPath}.srt`
    await writeFile(srtPath, input.subtitlesContent, "utf8")
    filters.push(`subtitles=${escapeFfmpegFilterPath(srtPath)}`)
  }

  await runFfmpegCommand(
    ffmpegBinary,
    [
      "-y",
      "-i",
      input.inputPath,
      "-vf",
      filters.join(","),
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-c:a",
      "aac",
      input.outputPath,
    ],
    timeoutMs,
  )
}
