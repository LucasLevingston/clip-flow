export class VideoNotFoundError extends Error {
  constructor(videoId: string) {
    super(`Video ${videoId} not found`)
    this.name = "VideoNotFoundError"
  }
}
