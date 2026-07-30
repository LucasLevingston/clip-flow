import type {
  FindPaginatedByUserInput,
  NotificationRepository,
  NotificationSnapshot,
  PaginatedNotifications,
} from "../../domain/notifications/repositories/NotificationRepository"
import { NotificationNotFoundError } from "../../domain/notifications/errors/NotificationNotFoundError"

export class InMemoryNotificationRepository implements NotificationRepository {
  private readonly notificationsById = new Map<string, NotificationSnapshot>()

  seed(notification: NotificationSnapshot): void {
    this.notificationsById.set(notification.id, notification)
  }

  findPaginatedByUser(input: FindPaginatedByUserInput): Promise<PaginatedNotifications> {
    const matching = [...this.notificationsById.values()]
      .filter((n) => n.tenantId === input.tenantId && n.userId === input.userId)
      .filter((n) => !input.unreadOnly || n.readAt === null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const start = (input.page - 1) * input.pageSize
    return Promise.resolve({
      items: matching.slice(start, start + input.pageSize),
      total: matching.length,
    })
  }

  findById(notificationId: string): Promise<NotificationSnapshot | null> {
    return Promise.resolve(this.notificationsById.get(notificationId) ?? null)
  }

  markRead(notificationId: string): Promise<NotificationSnapshot> {
    const existing = this.notificationsById.get(notificationId)
    if (!existing) {
      throw new NotificationNotFoundError(notificationId)
    }
    const updated = { ...existing, readAt: new Date() }
    this.notificationsById.set(notificationId, updated)
    return Promise.resolve(updated)
  }
}
