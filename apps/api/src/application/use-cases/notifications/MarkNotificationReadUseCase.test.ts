import { NotificationNotFoundError } from "../../../domain/notifications/errors/NotificationNotFoundError"
import { InMemoryNotificationRepository } from "../../../test-utils/fakes/InMemoryNotificationRepository"
import { MarkNotificationReadUseCase } from "./MarkNotificationReadUseCase"

function seed(repo: InMemoryNotificationRepository) {
  repo.seed({
    id: "notif-1",
    tenantId: "tenant-1",
    userId: "user-1",
    category: "VideoPublished",
    payload: {},
    readAt: null,
    createdAt: new Date("2026-07-01"),
  })
}

describe("MarkNotificationReadUseCase", () => {
  it("should mark the notification as read", async () => {
    const notificationRepository = new InMemoryNotificationRepository()
    seed(notificationRepository)
    const useCase = new MarkNotificationReadUseCase({ notificationRepository })

    const result = await useCase.execute({ userId: "user-1", notificationId: "notif-1" })

    expect(result.readAt).not.toBeNull()
  })

  it("should throw when the notification does not exist", async () => {
    const notificationRepository = new InMemoryNotificationRepository()
    const useCase = new MarkNotificationReadUseCase({ notificationRepository })

    await expect(useCase.execute({ userId: "user-1", notificationId: "ghost" })).rejects.toThrow(
      NotificationNotFoundError,
    )
  })

  it("should throw when the notification belongs to another user", async () => {
    const notificationRepository = new InMemoryNotificationRepository()
    seed(notificationRepository)
    const useCase = new MarkNotificationReadUseCase({ notificationRepository })

    await expect(
      useCase.execute({ userId: "someone-else", notificationId: "notif-1" }),
    ).rejects.toThrow(NotificationNotFoundError)
  })
})
