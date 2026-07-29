import { prisma, type Prisma } from "@clip-flow/database"
import type { AuditLog } from "../../domain/audit/entities/AuditLog"
import type { AuditLogRepository } from "../../domain/audit/repositories/AuditLogRepository"

export class AuditLogPrismaRepository implements AuditLogRepository {
  async save(entry: AuditLog): Promise<void> {
    await prisma.auditLog.create({
      data: {
        id: entry.id,
        actorUserId: entry.actorUserId,
        actorType: entry.actorType,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        ...(entry.metadata ? { metadata: entry.metadata as Prisma.InputJsonValue } : {}),
      },
    })
  }
}
