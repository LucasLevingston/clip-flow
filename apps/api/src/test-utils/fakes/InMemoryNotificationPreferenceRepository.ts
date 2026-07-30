import type {
  NotificationPreferenceRepository,
  StoredNotificationPreference,
} from "../../domain/notifications/repositories/NotificationPreferenceRepository"

export class InMemoryNotificationPreferenceRepository implements NotificationPreferenceRepository {
  private readonly preferencesByUser = new Map<string, Map<string, boolean>>()

  findAllByUser(userId: string): Promise<StoredNotificationPreference[]> {
    const byCategory = this.preferencesByUser.get(userId) ?? new Map<string, boolean>()
    return Promise.resolve(
      [...byCategory.entries()].map(([category, emailEnabled]) => ({ category, emailEnabled })),
    )
  }

  upsertMany(userId: string, preferences: StoredNotificationPreference[]): Promise<void> {
    const byCategory = this.preferencesByUser.get(userId) ?? new Map<string, boolean>()
    for (const preference of preferences) {
      byCategory.set(preference.category, preference.emailEnabled)
    }
    this.preferencesByUser.set(userId, byCategory)
    return Promise.resolve()
  }
}
