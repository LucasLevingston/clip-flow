import { InvalidNotificationCategoryError } from "../../../domain/notifications/errors/InvalidNotificationCategoryError"
import { InMemoryNotificationPreferenceRepository } from "../../../test-utils/fakes/InMemoryNotificationPreferenceRepository"
import { UpdateNotificationPreferencesUseCase } from "./UpdateNotificationPreferencesUseCase"

describe("UpdateNotificationPreferencesUseCase", () => {
  it("should upsert preferences and return the merged list", async () => {
    const notificationPreferenceRepository = new InMemoryNotificationPreferenceRepository()
    const useCase = new UpdateNotificationPreferencesUseCase({ notificationPreferenceRepository })

    const result = await useCase.execute({
      userId: "user-1",
      preferences: [{ category: "VideoPublished", emailEnabled: false }],
    })

    expect(result.find((pref) => pref.category === "VideoPublished")?.emailEnabled).toBe(false)
  })

  it("should reject an invalid category before writing anything", async () => {
    const notificationPreferenceRepository = new InMemoryNotificationPreferenceRepository()
    const useCase = new UpdateNotificationPreferencesUseCase({ notificationPreferenceRepository })

    await expect(
      useCase.execute({
        userId: "user-1",
        preferences: [{ category: "NotReal", emailEnabled: false }],
      }),
    ).rejects.toThrow(InvalidNotificationCategoryError)
    await expect(notificationPreferenceRepository.findAllByUser("user-1")).resolves.toEqual([])
  })
})
