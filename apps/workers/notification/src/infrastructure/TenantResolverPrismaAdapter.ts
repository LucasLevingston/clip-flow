import { prisma } from "@clip-flow/database"
import type { TenantResolver } from "../domain/services/TenantResolver"

export class TenantResolverPrismaAdapter implements TenantResolver {
  async resolveTenantIdByChannelId(channelId: string): Promise<string | null> {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { tenantId: true },
    })
    return channel?.tenantId ?? null
  }

  async resolveTenantIdByGeneratedVideoId(generatedVideoId: string): Promise<string | null> {
    const generatedVideo = await prisma.generatedVideo.findUnique({
      where: { id: generatedVideoId },
      select: { channel: { select: { tenantId: true } } },
    })
    return generatedVideo?.channel.tenantId ?? null
  }
}
