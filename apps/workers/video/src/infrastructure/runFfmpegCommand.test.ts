import { FfmpegProcessError } from "../domain/errors/FfmpegProcessError"
import { runFfmpegCommand } from "./runFfmpegCommand"

describe("runFfmpegCommand", () => {
  it("should resolve with stdout when the process exits successfully", async () => {
    const stdout = await runFfmpegCommand(
      process.execPath,
      ["-e", "process.stdout.write('hello'); process.exit(0)"],
      5_000,
    )

    expect(stdout).toBe("hello")
  })

  it("should reject with FfmpegProcessError when the process exits with a nonzero code", async () => {
    await expect(
      runFfmpegCommand(
        process.execPath,
        ["-e", "process.stderr.write('boom'); process.exit(1)"],
        5_000,
      ),
    ).rejects.toThrow(FfmpegProcessError)
  })

  it("should reject with a null exit code when the binary itself cannot be spawned", async () => {
    await expect(
      runFfmpegCommand("this-binary-does-not-exist-anywhere", [], 5_000),
    ).rejects.toThrow(FfmpegProcessError)
  })

  it("should include stderr in the thrown error message", async () => {
    await expect(
      runFfmpegCommand(
        process.execPath,
        ["-e", "process.stderr.write('specific failure'); process.exit(2)"],
        5_000,
      ),
    ).rejects.toThrow("specific failure")
  })
})
