export class OAuthRefreshFailedError extends Error {
  constructor(platform: string, statusCode: number) {
    super(`${platform} token refresh endpoint returned status ${statusCode}`)
    this.name = "OAuthRefreshFailedError"
  }
}
