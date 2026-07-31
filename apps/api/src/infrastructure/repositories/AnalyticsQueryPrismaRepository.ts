import { prisma } from "@clip-flow/database"
import { aggregateAnalyticsSummary } from "../../domain/analytics/services/aggregateAnalyticsSummary"
import type {
  AnalyticsQueryRepository,
  AnalyticsSummary,
  AnalyticsSummaryFilters,
  TimeseriesPoint,
} from "../../domain/analytics/repositories/AnalyticsQueryRepository"

export class AnalyticsQueryPrismaRepository implements AnalyticsQueryRepository {
  async getSummary(filters: AnalyticsSummaryFilters): Promise<AnalyticsSummary> {
    const publishRecords = await prisma.publishRecord.findMany({
      where: {
        status: "PUBLISHED",
        generatedVideo: {
          tenantId: filters.tenantId,
          ...(filters.channelId ? { channelId: filters.channelId } : {}),
        },
        ...(filters.from || filters.to
          ? {
              publishedAt: {
                ...(filters.from ? { gte: filters.from } : {}),
                ...(filters.to ? { lte: filters.to } : {}),
              },
            }
          : {}),
      },
      select: {
        generatedVideoId: true,
        platform: true,
        analyticsSnapshots: { orderBy: { collectedAt: "desc" }, take: 1 },
      },
    })

    return aggregateAnalyticsSummary(
      publishRecords.map((record) => {
        const snapshot = record.analyticsSnapshots[0]
        return {
          generatedVideoId: record.generatedVideoId,
          platform: record.platform,
          views: snapshot?.views ?? 0,
          likes: snapshot?.likes ?? 0,
          comments: snapshot?.comments ?? 0,
          shares: snapshot?.shares ?? 0,
        }
      }),
    )
  }

  async getVideoTimeseries(
    tenantId: string,
    generatedVideoId: string,
  ): Promise<TimeseriesPoint[] | null> {
    const video = await prisma.generatedVideo.findUnique({
      where: { id: generatedVideoId },
      select: { tenantId: true },
    })
    if (!video || video.tenantId !== tenantId) {
      return null
    }

    return prisma.analyticsSnapshot.findMany({
      where: { publishRecord: { generatedVideoId } },
      orderBy: { collectedAt: "asc" },
      select: { collectedAt: true, views: true, likes: true, comments: true },
    })
  }
}
