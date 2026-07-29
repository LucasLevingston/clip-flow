import { prisma, type Invitation as PrismaInvitation } from "@clip-flow/database"
import type {
  InvitationRecord,
  InvitationRepository,
} from "../../domain/identity/repositories/InvitationRepository"

function toDomain(record: PrismaInvitation): InvitationRecord {
  return {
    id: record.id,
    tenantId: record.tenantId,
    email: record.email,
    // OWNER is never persisted here — InviteMemberUseCase only accepts ADMIN/MEMBER.
    role: record.role as "ADMIN" | "MEMBER",
    status: record.status,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
  }
}

export class InvitationPrismaRepository implements InvitationRepository {
  async findPendingByTenantAndEmail(
    tenantId: string,
    email: string,
  ): Promise<InvitationRecord | null> {
    const record = await prisma.invitation.findFirst({
      where: { tenantId, email, status: "PENDING" },
    })
    return record ? toDomain(record) : null
  }

  async save(record: InvitationRecord): Promise<void> {
    await prisma.invitation.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        tenantId: record.tenantId,
        email: record.email,
        role: record.role,
        status: record.status,
        expiresAt: record.expiresAt,
      },
      update: {
        role: record.role,
        status: record.status,
        expiresAt: record.expiresAt,
      },
    })
  }
}
