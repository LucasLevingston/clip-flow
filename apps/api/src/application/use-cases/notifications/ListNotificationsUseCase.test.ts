import { InMemoryNotificationRepository } from "../../../test-utils/fakes/InMemoryNotificationRepository"
import { ListNotificationsUseCase } from "./ListNotificationsUseCase"

function seed(repo: InMemoryNotificationRepository, id: string, readAt: Date | null = null) {
  repo.seed({
    id,
    tenantId: "tenant-1",
    userId: "user-1",
    category: "VideoPublished",
    payload: {},
    readAt,
    createdAt: new Date(`2026-07-0${id.slice(-1)}`),
  })
}

describe("ListNotificationsUseCase", () => {
  it("should paginate the caller's notifications", async () => {
    const notificationRepository = new InMemoryNotificationRepository()
    seed(notificationRepository, "notif-1")
    seed(notificationRepository, "notif-2")
    const useCase = new ListNotificationsUseCase({ notificationRepository })

    const result = await useCase.execute({
      userId: "user-1",
      tenantId: "tenant-1",
      page: 1,
      pageSize: 20,
      unreadOnly: false,
    })

    expect(result.data).toHaveLength(2)
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 2 })
  })

  it("should filter unread notifications when requested", async () => {
    const notificationRepository = new InMemoryNotificationRepository()
    seed(notificationRepository, "notif-1", new Date())
    seed(notificationRepository, "notif-2", null)
    const useCase = new ListNotificationsUseCase({ notificationRepository })

    const result = await useCase.execute({
      userId: "user-1",
      tenantId: "tenant-1",
      page: 1,
      pageSize: 20,
      unreadOnly: true,
    })

    expect(result.data.map((n) => n.id)).toEqual(["notif-2"])
  })
})
