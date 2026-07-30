import { probeVideoDimensions } from "./probeVideoDimensions"
import { runFfmpegCommand } from "./runFfmpegCommand"

jest.mock("./runFfmpegCommand", () => ({ runFfmpegCommand: jest.fn() }))

describe("probeVideoDimensions", () => {
  it("should parse the ffprobe csv width/height output", async () => {
    jest.mocked(runFfmpegCommand).mockResolvedValue("1920x1080\n")

    const dimensions = await probeVideoDimensions("ffprobe", 5_000, "/tmp/video.mp4")

    expect(dimensions).toEqual({ width: 1_920, height: 1_080 })
  })

  it("should default to zero when the ffprobe output is empty", async () => {
    jest.mocked(runFfmpegCommand).mockResolvedValue("\n")

    const dimensions = await probeVideoDimensions("ffprobe", 5_000, "/tmp/video.mp4")

    expect(dimensions).toEqual({ width: 0, height: 0 })
  })
})
