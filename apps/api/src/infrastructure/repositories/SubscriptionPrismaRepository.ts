import { prisma, type Subscription as PrismaSubscription } from "@clip-flow/database"
import { Subscription } from "../../domain/billing/entities/Subscription"
import type { SubscriptionRepository } from "../../domain/billing/repositories/SubscriptionRepository"

function toDomain(record: PrismaSubscription): Subscription {
  return Subscription.create({
    id: record.id,
    tenantId: record.tenantId,
    planId: record.planId,
    status: record.status,
    currentPeriodEnd: record.currentPeriodEnd,
    stripeCustomerId: record.stripeCustomerId,
    stripeSubscriptionId: record.stripeSubscriptionId,
    createdAt: record.createdAt,
  })
}

export class SubscriptionPrismaRepository implements SubscriptionRepository {
  async createTrialSubscription(tenantId: string): Promise<void> {
    const trialPlan = await prisma.plan.findUniqueOrThrow({ where: { name: "TRIAL" } })

    await prisma.subscription.create({
      data: { tenantId, planId: trialPlan.id, status: "TRIAL" },
    })
  }

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    const record = await prisma.subscription.findUnique({ where: { tenantId } })
    return record ? toDomain(record) : null
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null> {
    const record = await prisma.subscription.findUnique({ where: { stripeCustomerId } })
    return record ? toDomain(record) : null
  }

  async save(subscription: Subscription): Promise<void> {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: subscription.planId,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      },
    })
  }
}
