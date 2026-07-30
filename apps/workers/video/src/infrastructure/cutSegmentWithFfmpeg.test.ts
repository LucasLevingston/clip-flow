import { cutSegmentWithFfmpeg } from "./cutSegmentWithFfmpeg"
import { runFfmpegCommand } from "./runFfmpegCommand"

jest.mock("./runFfmpegCommand", () => ({ runFfmpegCommand: jest.fn() }))

describe("cutSegmentWithFfmpeg", () => {
  it("should invoke ffmpeg with a fast stream-copy cut using seconds derived from milliseconds", async () => {
    jest.mocked(runFfmpegCommand).mockResolvedValue("")

    await cutSegmentWithFfmpeg("ffmpeg", 5_000, {
      sourceFilePath: "/tmp/source.mp4",
      startMs: 2_000,
      endMs: 22_000,
      outputPath: "/tmp/cut.mp4",
    })

    expect(runFfmpegCommand).toHaveBeenCalledWith(
      "ffmpeg",
      ["-y", "-ss", "2", "-i", "/tmp/source.mp4", "-t", "20", "-c", "copy", "/tmp/cut.mp4"],
      5_000,
    )
  })
})
