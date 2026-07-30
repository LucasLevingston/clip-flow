import { InvalidNotificationCategoryError } from "../../../domain/notifications/errors/InvalidNotificationCategoryError"
import { NOTIFICATION_CATEGORIES } from "../../../domain/notifications/types"
import type { NotificationPreferenceRepository } from "../../../domain/notifications/repositories/NotificationPreferenceRepository"
import type { NotificationPreferenceDto } from "../../../domain/notifications/types"

export interface UpdateNotificationPreferencesInput {
  userId: string
  preferences: { category: string; emailEnabled: boolean }[]
}

export interface UpdateNotificationPreferencesUseCaseDeps {
  notificationPreferenceRepository: NotificationPreferenceRepository
}

/** `PUT /v1/notification-preferences` — see docs/api/notifications-api.md. */
export class UpdateNotificationPreferencesUseCase {
  constructor(private readonly deps: UpdateNotificationPreferencesUseCaseDeps) {}

  async execute(input: UpdateNotificationPreferencesInput): Promise<NotificationPreferenceDto[]> {
    for (const preference of input.preferences) {
      if (!(NOTIFICATION_CATEGORIES as readonly string[]).includes(preference.category)) {
        throw new InvalidNotificationCategoryError(preference.category)
      }
    }

    await this.deps.notificationPreferenceRepository.upsertMany(input.userId, input.preferences)
    const stored = await this.deps.notificationPreferenceRepository.findAllByUser(input.userId)
    const emailEnabledByCategory = new Map(stored.map((pref) => [pref.category, pref.emailEnabled]))

    return NOTIFICATION_CATEGORIES.map((category) => ({
      category,
      emailEnabled: emailEnabledByCategory.get(category) ?? true,
    }))
  }
}
