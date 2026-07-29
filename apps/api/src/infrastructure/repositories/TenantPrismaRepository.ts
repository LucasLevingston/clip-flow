import { prisma, type Tenant as PrismaTenant } from "@clip-flow/database"
import { Tenant } from "../../domain/identity/entities/Tenant"
import type { TenantRepository } from "../../domain/identity/repositories/TenantRepository"

function toDomain(record: PrismaTenant): Tenant {
  return Tenant.create({
    id: record.id,
    name: record.name,
    timezone: record.timezone,
    createdAt: record.createdAt,
  })
}

export class TenantPrismaRepository implements TenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const record = await prisma.tenant.findUnique({ where: { id } })
    return record ? toDomain(record) : null
  }

  async save(tenant: Tenant): Promise<void> {
    await prisma.tenant.upsert({
      where: { id: tenant.id },
      create: { id: tenant.id, name: tenant.name, timezone: tenant.timezone },
      update: { name: tenant.name, timezone: tenant.timezone },
    })
  }
}
