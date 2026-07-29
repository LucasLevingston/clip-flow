import type { AuditLog } from "../entities/AuditLog"

export interface AuditLogRepository {
  save(entry: AuditLog): Promise<void>
}
