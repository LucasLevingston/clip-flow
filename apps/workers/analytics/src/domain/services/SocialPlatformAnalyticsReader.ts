import type { SocialAccountPlatform } from "../types"
import type { NormalizedMetrics } from "../types"

export interface SocialPlatformAnalyticsReader {
  getVideoStats(externalPostId: string, accessToken: string): Promise<NormalizedMetrics>
}

export type SocialPlatformAnalyticsReaderRegistry = Partial<
  Record<SocialAccountPlatform, SocialPlatformAnalyticsReader>
>
