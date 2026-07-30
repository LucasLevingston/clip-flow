export class FfmpegProcessError extends Error {
  constructor(exitCode: number | null, stderr: string) {
    super(`ffmpeg exited with code ${String(exitCode)}: ${stderr}`)
    this.name = "FfmpegProcessError"
  }
}
