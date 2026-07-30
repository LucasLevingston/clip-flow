export class PublisherRejectedError extends Error {
  constructor(platform: string, reason: string) {
    super(`${platform} rejected the video: ${reason}`)
    this.name = "PublisherRejectedError"
  }
}
