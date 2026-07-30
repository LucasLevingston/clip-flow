import type {
  CutSegmentInput,
  EncodeFinalInput,
  SampleFramesInput,
  VideoDimensions,
  VideoProcessingService,
} from "../domain/services/VideoProcessingService"

export class FakeVideoProcessingService implements VideoProcessingService {
  cutSegmentCalls: CutSegmentInput[] = []
  encodeFinalCalls: EncodeFinalInput[] = []
  sampleFramesToReturn: string[] = ["frame-1.jpg", "frame-2.jpg"]
  dimensionsToReturn: VideoDimensions = { width: 1_920, height: 1_080 }
  durationMsToReturn = 30_000

  cutSegment(input: CutSegmentInput): Promise<void> {
    this.cutSegmentCalls.push(input)
    return Promise.resolve()
  }

  extractSampleFrames(_input: SampleFramesInput): Promise<string[]> {
    return Promise.resolve(this.sampleFramesToReturn)
  }

  probeDimensions(_videoPath: string): Promise<VideoDimensions> {
    return Promise.resolve(this.dimensionsToReturn)
  }

  probeDurationMs(_videoPath: string): Promise<number> {
    return Promise.resolve(this.durationMsToReturn)
  }

  encodeFinal(input: EncodeFinalInput): Promise<void> {
    this.encodeFinalCalls.push(input)
    return Promise.resolve()
  }
}
