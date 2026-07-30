import { FfmpegVideoProcessingService } from "./FfmpegVideoProcessingService"
import { cutSegmentWithFfmpeg } from "./cutSegmentWithFfmpeg"
import { encodeFinalWithFfmpeg } from "./encodeFinalWithFfmpeg"
import { extractSampleFramesWithFfmpeg } from "./extractSampleFramesWithFfmpeg"
import { probeVideoDimensions } from "./probeVideoDimensions"
import { probeVideoDurationMs } from "./probeVideoDurationMs"

jest.mock("./cutSegmentWithFfmpeg", () => ({ cutSegmentWithFfmpeg: jest.fn() }))
jest.mock("./encodeFinalWithFfmpeg", () => ({ encodeFinalWithFfmpeg: jest.fn() }))
jest.mock("./extractSampleFramesWithFfmpeg", () => ({ extractSampleFramesWithFfmpeg: jest.fn() }))
jest.mock("./probeVideoDimensions", () => ({ probeVideoDimensions: jest.fn() }))
jest.mock("./probeVideoDurationMs", () => ({ probeVideoDurationMs: jest.fn() }))

describe("FfmpegVideoProcessingService", () => {
  it("should delegate every method to its dedicated helper with the configured binaries/timeout", async () => {
    const service = new FfmpegVideoProcessingService("custom-ffmpeg", "custom-ffprobe", 1_234)
    jest.mocked(cutSegmentWithFfmpeg).mockResolvedValue(undefined)
    jest.mocked(encodeFinalWithFfmpeg).mockResolvedValue(undefined)
    jest.mocked(extractSampleFramesWithFfmpeg).mockResolvedValue(["frame.jpg"])
    jest.mocked(probeVideoDimensions).mockResolvedValue({ width: 1, height: 1 })
    jest.mocked(probeVideoDurationMs).mockResolvedValue(1_000)

    const cutInput = { sourceFilePath: "a", startMs: 0, endMs: 1, outputPath: "b" }
    await service.cutSegment(cutInput)
    expect(cutSegmentWithFfmpeg).toHaveBeenCalledWith("custom-ffmpeg", 1_234, cutInput)

    const sampleInput = { videoPath: "a", count: 1, outputDir: "b" }
    await service.extractSampleFrames(sampleInput)
    expect(extractSampleFramesWithFfmpeg).toHaveBeenCalledWith(
      "custom-ffmpeg",
      "custom-ffprobe",
      1_234,
      sampleInput,
    )

    await service.probeDimensions("a")
    expect(probeVideoDimensions).toHaveBeenCalledWith("custom-ffprobe", 1_234, "a")

    await service.probeDurationMs("a")
    expect(probeVideoDurationMs).toHaveBeenCalledWith("custom-ffprobe", 1_234, "a")

    const encodeInput = {
      inputPath: "a",
      crop: { x: 0, y: 0, width: 1, height: 1 },
      subtitlesContent: null,
      outputPath: "b",
    }
    await service.encodeFinal(encodeInput)
    expect(encodeFinalWithFfmpeg).toHaveBeenCalledWith("custom-ffmpeg", 1_234, encodeInput)
  })

  it("should default to the ffmpeg/ffprobe binaries on PATH", () => {
    const service = new FfmpegVideoProcessingService()

    expect(service).toBeInstanceOf(FfmpegVideoProcessingService)
  })
})
