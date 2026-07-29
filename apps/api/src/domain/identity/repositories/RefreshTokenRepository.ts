export interface RefreshTokenRecord {
  id: string
  userId: string
  tokenHash: string
  deviceInfo: string | null
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}

export interface RefreshTokenRepository {
  create(
    record: Omit<RefreshTokenRecord, "id" | "createdAt" | "revokedAt">,
  ): Promise<RefreshTokenRecord>
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>
  revoke(id: string): Promise<void>
}
