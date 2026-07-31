import { prisma } from "@clip-flow/database"
import type {
  ChannelReadRepository,
  ChannelSnapshot,
} from "../domain/repositories/ChannelReadRepository"

export class ChannelPrismaReadRepository implements ChannelReadRepository {
  async findById(channelId: string): Promise<ChannelSnapshot | null> {
    const record = await prisma.channel.findFirst({ where: { id: channelId, deletedAt: null } })
    if (!record) return null

    return {
      id: record.id,
      tenantId: record.tenantId,
      nicheId: record.nicheId,
      status: record.status,
      platforms: record.platforms,
      videosPerDay: record.videosPerDay,
      publishTimes: record.publishTimes as string[],
      language: record.language,
    }
  }
}
