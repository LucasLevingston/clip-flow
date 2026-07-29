import { prisma } from "@clip-flow/database"
import type { SubscriptionReadRepository } from "../domain/repositories/SubscriptionReadRepository"
import type { SubscriptionStatus } from "../domain/types"

export class SubscriptionPrismaReadRepository implements SubscriptionReadRepository {
  async findStatusByTenantId(tenantId: string): Promise<SubscriptionStatus | null> {
    const record = await prisma.subscription.findFirst({ where: { tenantId } })
    return record ? record.status : null
  }
}
