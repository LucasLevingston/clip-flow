import { execFile } from "node:child_process"
import { FfmpegProcessError } from "../domain/errors/FfmpegProcessError"

export function runFfmpegCommand(
  binary: string,
  args: string[],
  timeoutMs: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(binary, args, { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        reject(new FfmpegProcessError(typeof error.code === "number" ? error.code : null, stderr))
        return
      }
      resolve(stdout)
    })
  })
}
