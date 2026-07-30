import { prisma } from "@clip-flow/database"
import type {
  SocialAccountRepository,
  SocialAccountSnapshot,
} from "../domain/repositories/SocialAccountRepository"
import type { SocialAccountPlatform } from "../domain/types"

export class SocialAccountPrismaRepository implements SocialAccountRepository {
  async findConnectedByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccountSnapshot | null> {
    const record = await prisma.socialAccount.findFirst({
      where: { channelId, platform, status: "CONNECTED" },
      select: {
        id: true,
        channelId: true,
        platform: true,
        encryptedTokens: true,
        tokenKeyVersion: true,
      },
    })
    if (!record) {
      return null
    }
    return { ...record, encryptedTokens: Buffer.from(record.encryptedTokens) }
  }

  async updateTokens(
    socialAccountId: string,
    encryptedTokens: Buffer,
    tokenKeyVersion: number,
  ): Promise<void> {
    await prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: { encryptedTokens: Uint8Array.from(encryptedTokens), tokenKeyVersion },
    })
  }

  async markNeedsReauth(socialAccountId: string): Promise<void> {
    await prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: { status: "NEEDS_REAUTH" },
    })
  }
}
