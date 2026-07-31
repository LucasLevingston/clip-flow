import type {
  AnalyticsQueryRepository,
  AnalyticsSummary,
  AnalyticsSummaryFilters,
  TimeseriesPoint,
} from "../../domain/analytics/repositories/AnalyticsQueryRepository"

const EMPTY_SUMMARY: AnalyticsSummary = {
  totalVideos: 0,
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
  subscribersGrowth: 0,
  byPlatform: { YOUTUBE: { videos: 0, views: 0 }, TIKTOK: { videos: 0, views: 0 } },
  topVideos: [],
}

export class FakeAnalyticsQueryRepository implements AnalyticsQueryRepository {
  summaryToReturn: AnalyticsSummary = EMPTY_SUMMARY
  lastSummaryFilters: AnalyticsSummaryFilters | null = null
  private readonly timeseriesByVideoId = new Map<string, TimeseriesPoint[]>()

  seedTimeseries(generatedVideoId: string, points: TimeseriesPoint[]): void {
    this.timeseriesByVideoId.set(generatedVideoId, points)
  }

  getSummary(filters: AnalyticsSummaryFilters): Promise<AnalyticsSummary> {
    this.lastSummaryFilters = filters
    return Promise.resolve(this.summaryToReturn)
  }

  getVideoTimeseries(
    _tenantId: string,
    generatedVideoId: string,
  ): Promise<TimeseriesPoint[] | null> {
    return Promise.resolve(this.timeseriesByVideoId.get(generatedVideoId) ?? null)
  }
}
