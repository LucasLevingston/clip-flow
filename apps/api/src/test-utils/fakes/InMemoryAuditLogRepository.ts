import type { AuditLog } from "../../domain/audit/entities/AuditLog"
import type { AuditLogRepository } from "../../domain/audit/repositories/AuditLogRepository"

export class InMemoryAuditLogRepository implements AuditLogRepository {
  readonly entries: AuditLog[] = []

  save(entry: AuditLog): Promise<void> {
    this.entries.push(entry)
    return Promise.resolve()
  }
}
