/** Thrown by a SocialPlatformAnalyticsReader when the post is gone/inaccessible — stops future collection. */
export class AnalyticsUnavailableError extends Error {
  constructor(platform: string, reason: string) {
    super(`Analytics unavailable on ${platform}: ${reason}`)
    this.name = "AnalyticsUnavailableError"
  }
}
