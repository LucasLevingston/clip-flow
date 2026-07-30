import type {
  CutSegmentInput,
  EncodeFinalInput,
  SampleFramesInput,
  VideoDimensions,
  VideoProcessingService,
} from "../domain/services/VideoProcessingService"
import { cutSegmentWithFfmpeg } from "./cutSegmentWithFfmpeg"
import { encodeFinalWithFfmpeg } from "./encodeFinalWithFfmpeg"
import { extractSampleFramesWithFfmpeg } from "./extractSampleFramesWithFfmpeg"
import { probeVideoDimensions } from "./probeVideoDimensions"
import { probeVideoDurationMs } from "./probeVideoDurationMs"

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1_000

/** FFmpeg via child_process (ADR-0009) — timeout applies to every individual ffmpeg/ffprobe call. */
export class FfmpegVideoProcessingService implements VideoProcessingService {
  constructor(
    private readonly ffmpegBinary = "ffmpeg",
    private readonly ffprobeBinary = "ffprobe",
    private readonly timeoutMs = DEFAULT_TIMEOUT_MS,
  ) {}

  cutSegment(input: CutSegmentInput): Promise<void> {
    return cutSegmentWithFfmpeg(this.ffmpegBinary, this.timeoutMs, input)
  }

  extractSampleFrames(input: SampleFramesInput): Promise<string[]> {
    return extractSampleFramesWithFfmpeg(
      this.ffmpegBinary,
      this.ffprobeBinary,
      this.timeoutMs,
      input,
    )
  }

  probeDimensions(videoPath: string): Promise<VideoDimensions> {
    return probeVideoDimensions(this.ffprobeBinary, this.timeoutMs, videoPath)
  }

  probeDurationMs(videoPath: string): Promise<number> {
    return probeVideoDurationMs(this.ffprobeBinary, this.timeoutMs, videoPath)
  }

  encodeFinal(input: EncodeFinalInput): Promise<void> {
    return encodeFinalWithFfmpeg(this.ffmpegBinary, this.timeoutMs, input)
  }
}
