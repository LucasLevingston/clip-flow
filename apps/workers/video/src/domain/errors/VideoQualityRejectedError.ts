export class VideoQualityRejectedError extends Error {
  constructor(generatedVideoId: string) {
    super(`Final asset for GeneratedVideo ${generatedVideoId} did not pass the quality gate`)
    this.name = "VideoQualityRejectedError"
  }
}
