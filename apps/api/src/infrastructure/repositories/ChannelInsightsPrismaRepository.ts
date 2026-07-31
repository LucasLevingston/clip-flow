import { prisma } from "@clip-flow/database"
import type {
  ChannelInsightsRepository,
  ChannelInsightsSnapshot,
} from "../../domain/channel-management/repositories/ChannelInsightsRepository"

export class ChannelInsightsPrismaRepository implements ChannelInsightsRepository {
  async findByChannelId(channelId: string): Promise<ChannelInsightsSnapshot | null> {
    return prisma.channelInsights.findUnique({
      where: { channelId },
      select: {
        bestPublishHours: true,
        topTitlePatterns: true,
        topHashtags: true,
        avgOptimalDurationMs: true,
        computedAt: true,
      },
    })
  }
}
