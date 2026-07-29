import { prisma } from "@clip-flow/database"
import type { ChannelInsightsRepository } from "../domain/repositories/ChannelInsightsRepository"
import type { ChannelInsightsSnapshot } from "../domain/types"

export class ChannelInsightsPrismaRepository implements ChannelInsightsRepository {
  async findByChannelId(channelId: string): Promise<ChannelInsightsSnapshot | null> {
    const record = await prisma.channelInsights.findUnique({ where: { channelId } })
    if (!record) {
      return null
    }
    return {
      bestPublishHours: record.bestPublishHours,
      topTitlePatterns: record.topTitlePatterns,
      topHashtags: record.topHashtags,
      avgOptimalDurationMs: record.avgOptimalDurationMs,
    }
  }
}
