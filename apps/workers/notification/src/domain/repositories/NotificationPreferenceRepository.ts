export interface NotificationPreferenceRepository {
  findEmailEnabled(userId: string, category: string): Promise<boolean | null>
}
