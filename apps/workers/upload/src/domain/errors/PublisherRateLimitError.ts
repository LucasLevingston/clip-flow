export class PublisherRateLimitError extends Error {
  constructor(platform: string) {
    super(`${platform} rate limit/quota exceeded`)
    this.name = "PublisherRateLimitError"
  }
}
