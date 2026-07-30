export interface StoredNotificationPreference {
  category: string
  emailEnabled: boolean
}

export interface NotificationPreferenceRepository {
  findAllByUser(userId: string): Promise<StoredNotificationPreference[]>
  upsertMany(userId: string, preferences: StoredNotificationPreference[]): Promise<void>
}
