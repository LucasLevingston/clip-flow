import { NOTIFICATION_CATEGORIES } from "../../../domain/notifications/types"
import { InMemoryNotificationPreferenceRepository } from "../../../test-utils/fakes/InMemoryNotificationPreferenceRepository"
import { ListNotificationPreferencesUseCase } from "./ListNotificationPreferencesUseCase"

describe("ListNotificationPreferencesUseCase", () => {
  it("should default every category to enabled when unconfigured", async () => {
    const notificationPreferenceRepository = new InMemoryNotificationPreferenceRepository()
    const useCase = new ListNotificationPreferencesUseCase({ notificationPreferenceRepository })

    const result = await useCase.execute({ userId: "user-1" })

    expect(result).toHaveLength(NOTIFICATION_CATEGORIES.length)
    expect(result.every((pref) => pref.emailEnabled)).toBe(true)
  })

  it("should reflect a stored override", async () => {
    const notificationPreferenceRepository = new InMemoryNotificationPreferenceRepository()
    await notificationPreferenceRepository.upsertMany("user-1", [
      { category: "VideoPublished", emailEnabled: false },
    ])
    const useCase = new ListNotificationPreferencesUseCase({ notificationPreferenceRepository })

    const result = await useCase.execute({ userId: "user-1" })

    expect(result.find((pref) => pref.category === "VideoPublished")?.emailEnabled).toBe(false)
  })
})
