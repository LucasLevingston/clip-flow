import { Prisma, prisma } from "@clip-flow/database"
import type {
  ChannelInsightsRepository,
  ChannelInsightsUpsertInput,
} from "../domain/repositories/ChannelInsightsRepository"

export class ChannelInsightsPrismaRepository implements ChannelInsightsRepository {
  async upsert(input: ChannelInsightsUpsertInput): Promise<void> {
    const data = {
      bestPublishHours: input.bestPublishHours as Prisma.InputJsonValue,
      topTitlePatterns: input.topTitlePatterns as Prisma.InputJsonValue,
      topHashtags: input.topHashtags as Prisma.InputJsonValue,
      avgOptimalDurationMs: input.avgOptimalDurationMs,
      computedAt: input.computedAt,
    }
    await prisma.channelInsights.upsert({
      where: { channelId: input.channelId },
      create: { channelId: input.channelId, ...data },
      update: data,
    })
  }
}
