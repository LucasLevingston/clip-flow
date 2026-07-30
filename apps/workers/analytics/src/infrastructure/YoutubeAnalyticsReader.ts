import { AnalyticsUnavailableError } from "../domain/errors/AnalyticsUnavailableError"
import type { SocialPlatformAnalyticsReader } from "../domain/services/SocialPlatformAnalyticsReader"
import type { NormalizedMetrics } from "../domain/types"

const REPORTS_URL = "https://youtubeanalytics.googleapis.com/v2/reports"
const METRICS = [
  "views",
  "likes",
  "comments",
  "shares",
  "averageViewPercentage",
  "annotationClickThroughRate",
]

interface YoutubeAnalyticsReportResponse {
  columnHeaders: { name: string }[]
  rows?: number[][]
}

/** Video-level report — see docs/integrations/youtube.md. RF-13 normalized metrics. */
export class YoutubeAnalyticsReader implements SocialPlatformAnalyticsReader {
  async getVideoStats(externalPostId: string, accessToken: string): Promise<NormalizedMetrics> {
    const url = new URL(REPORTS_URL)
    url.searchParams.set("ids", "channel==MINE")
    url.searchParams.set("startDate", "2005-01-01")
    url.searchParams.set("endDate", new Date().toISOString().slice(0, 10))
    url.searchParams.set("metrics", METRICS.join(","))
    url.searchParams.set("filters", `video==${externalPostId}`)

    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (!response.ok) {
      throw new AnalyticsUnavailableError("YouTube", `status ${response.status}`)
    }

    const body = (await response.json()) as YoutubeAnalyticsReportResponse
    const row = body.rows?.[0]
    if (!row) {
      throw new AnalyticsUnavailableError("YouTube", "no data returned for video")
    }

    const valueByMetric = new Map(
      body.columnHeaders.map((header, index) => [header.name, row[index] ?? 0]),
    )
    return {
      views: valueByMetric.get("views") ?? 0,
      likes: valueByMetric.get("likes") ?? 0,
      comments: valueByMetric.get("comments") ?? 0,
      shares: valueByMetric.get("shares") ?? 0,
      retentionRate: valueByMetric.get("averageViewPercentage") ?? 0,
      ctr: valueByMetric.get("annotationClickThroughRate") ?? 0,
    }
  }
}
