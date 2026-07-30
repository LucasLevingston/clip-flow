import { prisma } from "@clip-flow/database"
import type { ChannelRepository, ChannelSnapshot } from "../domain/repositories/ChannelRepository"

export class ChannelPrismaRepository implements ChannelRepository {
  findById(channelId: string): Promise<ChannelSnapshot | null> {
    return prisma.channel.findUnique({
      where: { id: channelId },
      select: { id: true, thumbnailEnabled: true },
    })
  }
}
