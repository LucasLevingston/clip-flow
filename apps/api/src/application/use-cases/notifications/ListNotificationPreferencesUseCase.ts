import { NOTIFICATION_CATEGORIES } from "../../../domain/notifications/types"
import type { NotificationPreferenceRepository } from "../../../domain/notifications/repositories/NotificationPreferenceRepository"
import type { NotificationPreferenceDto } from "../../../domain/notifications/types"

export interface ListNotificationPreferencesInput {
  userId: string
}

export interface ListNotificationPreferencesUseCaseDeps {
  notificationPreferenceRepository: NotificationPreferenceRepository
}

/** `GET /v1/notification-preferences` — see docs/api/notifications-api.md. */
export class ListNotificationPreferencesUseCase {
  constructor(private readonly deps: ListNotificationPreferencesUseCaseDeps) {}

  async execute(input: ListNotificationPreferencesInput): Promise<NotificationPreferenceDto[]> {
    const stored = await this.deps.notificationPreferenceRepository.findAllByUser(input.userId)
    const emailEnabledByCategory = new Map(stored.map((pref) => [pref.category, pref.emailEnabled]))

    return NOTIFICATION_CATEGORIES.map((category) => ({
      category,
      emailEnabled: emailEnabledByCategory.get(category) ?? true,
    }))
  }
}
