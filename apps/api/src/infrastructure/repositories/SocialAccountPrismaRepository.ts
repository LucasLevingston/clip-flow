import { prisma, type SocialAccount as PrismaSocialAccount } from "@clip-flow/database"
import { SocialAccount } from "../../domain/channel-management/entities/SocialAccount"
import type { SocialAccountRepository } from "../../domain/channel-management/repositories/SocialAccountRepository"
import type { SocialAccountPlatform } from "../../domain/channel-management/types"

function toDomain(record: PrismaSocialAccount): SocialAccount {
  return SocialAccount.create({
    id: record.id,
    channelId: record.channelId,
    platform: record.platform,
    externalAccountId: record.externalAccountId,
    status: record.status,
    encryptedTokens: Buffer.from(record.encryptedTokens),
    tokenKeyVersion: record.tokenKeyVersion,
    refreshExpiresAt: record.refreshExpiresAt,
    createdAt: record.createdAt,
  })
}

export class SocialAccountPrismaRepository implements SocialAccountRepository {
  async findById(id: string): Promise<SocialAccount | null> {
    const record = await prisma.socialAccount.findFirst({ where: { id, deletedAt: null } })
    return record ? toDomain(record) : null
  }

  async findByIdAndChannel(id: string, channelId: string): Promise<SocialAccount | null> {
    const record = await prisma.socialAccount.findFirst({
      where: { id, channelId, deletedAt: null },
    })
    return record ? toDomain(record) : null
  }

  async findByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccount | null> {
    const record = await prisma.socialAccount.findFirst({
      where: { channelId, platform, deletedAt: null },
    })
    return record ? toDomain(record) : null
  }

  async findByChannelId(channelId: string): Promise<SocialAccount[]> {
    const records = await prisma.socialAccount.findMany({ where: { channelId, deletedAt: null } })
    return records.map(toDomain)
  }

  async save(account: SocialAccount): Promise<void> {
    const data = {
      channelId: account.channelId,
      platform: account.platform,
      externalAccountId: account.externalAccountId,
      status: account.status,
      encryptedTokens: Uint8Array.from(account.encryptedTokens),
      tokenKeyVersion: account.tokenKeyVersion,
      refreshExpiresAt: account.refreshExpiresAt,
    }

    await prisma.socialAccount.upsert({
      where: { id: account.id },
      create: { id: account.id, ...data },
      update: data,
    })
  }

  async delete(id: string, channelId: string): Promise<void> {
    await prisma.socialAccount.updateMany({
      where: { id, channelId },
      data: { deletedAt: new Date() },
    })
  }
}
