import type { SocialPlatformAnalyticsReader } from "../domain/services/SocialPlatformAnalyticsReader"
import type { NormalizedMetrics } from "../domain/types"

export class FakeSocialPlatformAnalyticsReader implements SocialPlatformAnalyticsReader {
  calls: { externalPostId: string; accessToken: string }[] = []
  metricsToReturn: NormalizedMetrics = {
    views: 100,
    likes: 10,
    comments: 5,
    shares: 2,
    retentionRate: 50,
    ctr: 1.5,
  }
  errorToThrow: Error | null = null

  getVideoStats(externalPostId: string, accessToken: string): Promise<NormalizedMetrics> {
    this.calls.push({ externalPostId, accessToken })
    if (this.errorToThrow) {
      return Promise.reject(this.errorToThrow)
    }
    return Promise.resolve(this.metricsToReturn)
  }
}
