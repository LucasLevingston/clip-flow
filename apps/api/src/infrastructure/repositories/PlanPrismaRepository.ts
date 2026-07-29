import { prisma, type Plan as PrismaPlan } from "@clip-flow/database"
import { Plan } from "../../domain/billing/entities/Plan"
import type { PlanRepository } from "../../domain/billing/repositories/PlanRepository"

function toDomain(record: PrismaPlan): Plan {
  return Plan.create({
    id: record.id,
    name: record.name,
    maxChannels: record.maxChannels,
    maxVideosPerDayPerChannel: record.maxVideosPerDayPerChannel,
    priceCents: record.priceCents,
    stripePriceId: record.stripePriceId,
  })
}

export class PlanPrismaRepository implements PlanRepository {
  async findAll(): Promise<Plan[]> {
    const records = await prisma.plan.findMany({ orderBy: { priceCents: "asc" } })
    return records.map(toDomain)
  }

  async findById(id: string): Promise<Plan | null> {
    const record = await prisma.plan.findUnique({ where: { id } })
    return record ? toDomain(record) : null
  }
}
