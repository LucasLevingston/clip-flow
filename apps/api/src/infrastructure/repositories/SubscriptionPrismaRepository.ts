import { prisma } from "@clip-flow/database"
import type { SubscriptionRepository } from "../../domain/billing/repositories/SubscriptionRepository"

export class SubscriptionPrismaRepository implements SubscriptionRepository {
  async createTrialSubscription(tenantId: string): Promise<void> {
    const trialPlan = await prisma.plan.findUniqueOrThrow({ where: { name: "TRIAL" } })

    await prisma.subscription.create({
      data: { tenantId, planId: trialPlan.id, status: "TRIAL" },
    })
  }
}
