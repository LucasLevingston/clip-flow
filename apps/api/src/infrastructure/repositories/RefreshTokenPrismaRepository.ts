import { prisma, type RefreshToken as PrismaRefreshToken } from "@clip-flow/database"
import type {
  RefreshTokenRecord,
  RefreshTokenRepository,
} from "../../domain/identity/repositories/RefreshTokenRepository"

function toRecord(row: PrismaRefreshToken): RefreshTokenRecord {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    deviceInfo: row.deviceInfo,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
  }
}

export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
  async create(
    record: Omit<RefreshTokenRecord, "id" | "createdAt" | "revokedAt">,
  ): Promise<RefreshTokenRecord> {
    const row = await prisma.refreshToken.create({
      data: {
        userId: record.userId,
        tokenHash: record.tokenHash,
        deviceInfo: record.deviceInfo,
        expiresAt: record.expiresAt,
      },
    })
    return toRecord(row)
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const row = await prisma.refreshToken.findUnique({ where: { tokenHash } })
    return row ? toRecord(row) : null
  }

  async revoke(id: string): Promise<void> {
    await prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } })
  }
}
