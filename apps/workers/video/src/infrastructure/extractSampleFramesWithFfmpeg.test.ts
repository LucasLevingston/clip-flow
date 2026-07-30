import { mkdir } from "node:fs/promises"
import { extractSampleFramesWithFfmpeg } from "./extractSampleFramesWithFfmpeg"
import { listFrameFiles } from "./listFrameFiles"
import { probeVideoDurationMs } from "./probeVideoDurationMs"
import { runFfmpegCommand } from "./runFfmpegCommand"

jest.mock("node:fs/promises", () => ({ mkdir: jest.fn() }))
jest.mock("./listFrameFiles", () => ({ listFrameFiles: jest.fn() }))
jest.mock("./probeVideoDurationMs", () => ({ probeVideoDurationMs: jest.fn() }))
jest.mock("./runFfmpegCommand", () => ({ runFfmpegCommand: jest.fn() }))

describe("extractSampleFramesWithFfmpeg", () => {
  it("should create the output dir, extract frames at an even interval, and return the frame list", async () => {
    jest.mocked(mkdir).mockResolvedValue(undefined)
    jest.mocked(probeVideoDurationMs).mockResolvedValue(20_000)
    jest.mocked(runFfmpegCommand).mockResolvedValue("")
    jest.mocked(listFrameFiles).mockResolvedValue(["/tmp/frames/frame-001.jpg"])

    const result = await extractSampleFramesWithFfmpeg("ffmpeg", "ffprobe", 5_000, {
      videoPath: "/tmp/cut.mp4",
      count: 4,
      outputDir: "/tmp/frames",
    })

    expect(mkdir).toHaveBeenCalledWith("/tmp/frames", { recursive: true })
    expect(runFfmpegCommand).toHaveBeenCalledWith(
      "ffmpeg",
      expect.arrayContaining(["-vf", "fps=1/5"]),
      5_000,
    )
    expect(result).toEqual(["/tmp/frames/frame-001.jpg"])
  })

  it("should enforce a minimum sampling interval for very short videos", async () => {
    jest.mocked(mkdir).mockResolvedValue(undefined)
    jest.mocked(probeVideoDurationMs).mockResolvedValue(1_000)
    jest.mocked(runFfmpegCommand).mockResolvedValue("")
    jest.mocked(listFrameFiles).mockResolvedValue([])

    await extractSampleFramesWithFfmpeg("ffmpeg", "ffprobe", 5_000, {
      videoPath: "/tmp/cut.mp4",
      count: 4,
      outputDir: "/tmp/frames",
    })

    expect(runFfmpegCommand).toHaveBeenCalledWith(
      "ffmpeg",
      expect.arrayContaining(["-vf", "fps=1/0.5"]),
      5_000,
    )
  })
})
