import { prisma } from "@clip-flow/database"
import type { RecipientRepository } from "../domain/repositories/RecipientRepository"

export class RecipientPrismaRepository implements RecipientRepository {
  async findTenantMemberUserIds(tenantId: string): Promise<string[]> {
    const memberships = await prisma.membership.findMany({
      where: { tenantId },
      select: { userId: true },
    })
    return memberships.map((membership) => membership.userId)
  }

  async findPlatformAdminUserIds(): Promise<string[]> {
    const admins = await prisma.user.findMany({
      where: { isPlatformAdmin: true },
      select: { id: true },
    })
    return admins.map((admin) => admin.id)
  }

  async findUserEmail(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    return user?.email ?? null
  }
}
