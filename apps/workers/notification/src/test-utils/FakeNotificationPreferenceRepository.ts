import type { NotificationPreferenceRepository } from "../domain/repositories/NotificationPreferenceRepository"

export class FakeNotificationPreferenceRepository implements NotificationPreferenceRepository {
  private readonly preferences = new Map<string, boolean>()

  seed(userId: string, category: string, emailEnabled: boolean): void {
    this.preferences.set(`${userId}:${category}`, emailEnabled)
  }

  findEmailEnabled(userId: string, category: string): Promise<boolean | null> {
    const value = this.preferences.get(`${userId}:${category}`)
    return Promise.resolve(value === undefined ? null : value)
  }
}
