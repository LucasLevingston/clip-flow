import { prisma } from "@clip-flow/database"
import type { NotificationPreferenceRepository } from "../domain/repositories/NotificationPreferenceRepository"

export class NotificationPreferencePrismaRepository implements NotificationPreferenceRepository {
  async findEmailEnabled(userId: string, category: string): Promise<boolean | null> {
    const preference = await prisma.notificationPreference.findUnique({
      where: { userId_category: { userId, category } },
      select: { emailEnabled: true },
    })
    return preference?.emailEnabled ?? null
  }
}
