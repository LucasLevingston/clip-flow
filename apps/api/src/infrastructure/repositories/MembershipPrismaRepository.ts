import { prisma, type Membership as PrismaMembership } from "@clip-flow/database"
import { Membership } from "../../domain/identity/entities/Membership"
import type { MembershipRepository } from "../../domain/identity/repositories/MembershipRepository"

function toDomain(record: PrismaMembership): Membership {
  return Membership.create({
    id: record.id,
    tenantId: record.tenantId,
    userId: record.userId,
    role: record.role,
    createdAt: record.createdAt,
  })
}

export class MembershipPrismaRepository implements MembershipRepository {
  async findByTenantAndUser(tenantId: string, userId: string): Promise<Membership | null> {
    const record = await prisma.membership.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    })
    return record ? toDomain(record) : null
  }

  async findByTenantId(tenantId: string): Promise<Membership[]> {
    const records = await prisma.membership.findMany({ where: { tenantId } })
    return records.map(toDomain)
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    const records = await prisma.membership.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    })
    return records.map(toDomain)
  }

  async save(membership: Membership): Promise<void> {
    await prisma.membership.upsert({
      where: { id: membership.id },
      create: {
        id: membership.id,
        tenantId: membership.tenantId,
        userId: membership.userId,
        role: membership.role,
      },
      update: { role: membership.role },
    })
  }
}
