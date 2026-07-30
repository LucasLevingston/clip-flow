import { probeVideoDurationMs } from "./probeVideoDurationMs"
import { runFfmpegCommand } from "./runFfmpegCommand"

jest.mock("./runFfmpegCommand", () => ({ runFfmpegCommand: jest.fn() }))

describe("probeVideoDurationMs", () => {
  it("should convert the ffprobe seconds output to milliseconds", async () => {
    jest.mocked(runFfmpegCommand).mockResolvedValue("12.345\n")

    const durationMs = await probeVideoDurationMs("ffprobe", 5_000, "/tmp/video.mp4")

    expect(durationMs).toBe(12_345)
    expect(runFfmpegCommand).toHaveBeenCalledWith(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        "/tmp/video.mp4",
      ],
      5_000,
    )
  })
})
