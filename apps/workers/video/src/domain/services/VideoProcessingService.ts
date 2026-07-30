import type { CropRegion } from "../types"

export interface CutSegmentInput {
  sourceFilePath: string
  startMs: number
  endMs: number
  outputPath: string
}

export interface SampleFramesInput {
  videoPath: string
  count: number
  outputDir: string
}

export interface EncodeFinalInput {
  inputPath: string
  crop: CropRegion
  subtitlesContent: string | null
  outputPath: string
}

export interface VideoDimensions {
  width: number
  height: number
}

/** FFmpeg, invoked via child_process — never called directly from application/domain code (DIP). */
export interface VideoProcessingService {
  cutSegment(input: CutSegmentInput): Promise<void>
  extractSampleFrames(input: SampleFramesInput): Promise<string[]>
  probeDimensions(videoPath: string): Promise<VideoDimensions>
  probeDurationMs(videoPath: string): Promise<number>
  encodeFinal(input: EncodeFinalInput): Promise<void>
}
