import type {
  RefreshTokenRecord,
  RefreshTokenRepository,
} from "../../domain/identity/repositories/RefreshTokenRepository"

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private readonly recordsById = new Map<string, RefreshTokenRecord>()
  private nextId = 1

  create(
    record: Omit<RefreshTokenRecord, "id" | "createdAt" | "revokedAt">,
  ): Promise<RefreshTokenRecord> {
    const full: RefreshTokenRecord = {
      ...record,
      id: `refresh-token-${this.nextId++}`,
      createdAt: new Date(),
      revokedAt: null,
    }
    this.recordsById.set(full.id, full)
    return Promise.resolve(full)
  }

  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    for (const record of this.recordsById.values()) {
      if (record.tokenHash === tokenHash) {
        return Promise.resolve(record)
      }
    }
    return Promise.resolve(null)
  }

  revoke(id: string): Promise<void> {
    const record = this.recordsById.get(id)
    if (record) {
      this.recordsById.set(id, { ...record, revokedAt: new Date() })
    }
    return Promise.resolve()
  }
}
