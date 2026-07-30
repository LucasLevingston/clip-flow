import { prisma } from "@clip-flow/database"
import type {
  NotificationPreferenceRepository,
  StoredNotificationPreference,
} from "../../domain/notifications/repositories/NotificationPreferenceRepository"

export class NotificationPreferencePrismaRepository implements NotificationPreferenceRepository {
  async findAllByUser(userId: string): Promise<StoredNotificationPreference[]> {
    const records = await prisma.notificationPreference.findMany({
      where: { userId },
      select: { category: true, emailEnabled: true },
    })
    return records
  }

  async upsertMany(userId: string, preferences: StoredNotificationPreference[]): Promise<void> {
    await Promise.all(
      preferences.map((preference) =>
        prisma.notificationPreference.upsert({
          where: { userId_category: { userId, category: preference.category } },
          create: { userId, category: preference.category, emailEnabled: preference.emailEnabled },
          update: { emailEnabled: preference.emailEnabled },
        }),
      ),
    )
  }
}
