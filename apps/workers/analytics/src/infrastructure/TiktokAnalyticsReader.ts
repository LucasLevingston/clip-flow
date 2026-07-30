import { AnalyticsUnavailableError } from "../domain/errors/AnalyticsUnavailableError"
import type { SocialPlatformAnalyticsReader } from "../domain/services/SocialPlatformAnalyticsReader"
import type { NormalizedMetrics } from "../domain/types"

const QUERY_URL =
  "https://open.tiktokapis.com/v2/video/query/?fields=id,view_count,like_count,comment_count,share_count"

interface TiktokVideoQueryResponse {
  data?: {
    videos?: {
      id: string
      view_count: number
      like_count: number
      comment_count: number
      share_count: number
    }[]
  }
}

/**
 * TikTok's basic Display API has no retention/CTR metric — normalized as 0
 * (documented gap; would require the separate Business/Ads API).
 */
export class TiktokAnalyticsReader implements SocialPlatformAnalyticsReader {
  async getVideoStats(externalPostId: string, accessToken: string): Promise<NormalizedMetrics> {
    const response = await fetch(QUERY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters: { video_ids: [externalPostId] } }),
    })
    if (!response.ok) {
      throw new AnalyticsUnavailableError("TikTok", `status ${response.status}`)
    }

    const body = (await response.json()) as TiktokVideoQueryResponse
    const video = body.data?.videos?.[0]
    if (!video) {
      throw new AnalyticsUnavailableError("TikTok", "no data returned for video")
    }

    return {
      views: video.view_count,
      likes: video.like_count,
      comments: video.comment_count,
      shares: video.share_count,
      retentionRate: 0,
      ctr: 0,
    }
  }
}
