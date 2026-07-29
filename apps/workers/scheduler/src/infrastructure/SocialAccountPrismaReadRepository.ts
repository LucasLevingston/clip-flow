import { prisma } from "@clip-flow/database"
import type { SocialAccountReadRepository } from "../domain/repositories/SocialAccountReadRepository"
import type { SocialAccountPlatform } from "../domain/types"

export class SocialAccountPrismaReadRepository implements SocialAccountReadRepository {
  async findConnectedPlatformsByChannelId(channelId: string): Promise<SocialAccountPlatform[]> {
    const records = await prisma.socialAccount.findMany({
      where: { channelId, status: "CONNECTED", deletedAt: null },
      select: { platform: true },
    })
    return records.map((record) => record.platform)
  }
}
