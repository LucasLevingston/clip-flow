import { writeFile } from "node:fs/promises"
import { encodeFinalWithFfmpeg } from "./encodeFinalWithFfmpeg"
import { runFfmpegCommand } from "./runFfmpegCommand"

jest.mock("node:fs/promises", () => ({ writeFile: jest.fn() }))
jest.mock("./runFfmpegCommand", () => ({ runFfmpegCommand: jest.fn() }))

const crop = { x: 100, y: 0, width: 608, height: 1_080 }

describe("encodeFinalWithFfmpeg", () => {
  it("should encode with only a crop filter when there are no subtitles", async () => {
    jest.mocked(runFfmpegCommand).mockResolvedValue("")

    await encodeFinalWithFfmpeg("ffmpeg", 5_000, {
      inputPath: "/tmp/cut.mp4",
      crop,
      subtitlesContent: null,
      outputPath: "/tmp/final.mp4",
    })

    expect(writeFile).not.toHaveBeenCalled()
    expect(runFfmpegCommand).toHaveBeenCalledWith(
      "ffmpeg",
      expect.arrayContaining(["-vf", "crop=608:1080:100:0"]),
      5_000,
    )
  })

  it("should write an SRT file and append the subtitles filter when subtitles are provided", async () => {
    jest.mocked(runFfmpegCommand).mockResolvedValue("")
    jest.mocked(writeFile).mockResolvedValue(undefined)

    await encodeFinalWithFfmpeg("ffmpeg", 5_000, {
      inputPath: "/tmp/cut.mp4",
      crop,
      subtitlesContent: "1\n00:00:00,000 --> 00:00:01,000\nhello\n",
      outputPath: "/tmp/final.mp4",
    })

    expect(writeFile).toHaveBeenCalledWith(
      "/tmp/final.mp4.srt",
      "1\n00:00:00,000 --> 00:00:01,000\nhello\n",
      "utf8",
    )
    expect(runFfmpegCommand).toHaveBeenCalledWith(
      "ffmpeg",
      expect.arrayContaining(["-vf", "crop=608:1080:100:0,subtitles=/tmp/final.mp4.srt"]),
      5_000,
    )
  })
})
