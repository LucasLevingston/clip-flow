export class PublisherAuthError extends Error {
  constructor(platform: string) {
    super(`${platform} rejected the refresh token (revoked/expired)`)
    this.name = "PublisherAuthError"
  }
}
