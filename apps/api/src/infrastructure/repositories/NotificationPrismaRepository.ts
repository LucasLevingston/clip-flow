import { prisma } from "@clip-flow/database"
import type {
  FindPaginatedByUserInput,
  NotificationRepository,
  NotificationSnapshot,
  PaginatedNotifications,
} from "../../domain/notifications/repositories/NotificationRepository"

export class NotificationPrismaRepository implements NotificationRepository {
  async findPaginatedByUser(input: FindPaginatedByUserInput): Promise<PaginatedNotifications> {
    const where = {
      tenantId: input.tenantId,
      userId: input.userId,
      ...(input.unreadOnly ? { readAt: null } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      prisma.notification.count({ where }),
    ])

    return { items: items.map(toSnapshot), total }
  }

  async findById(notificationId: string): Promise<NotificationSnapshot | null> {
    const record = await prisma.notification.findUnique({ where: { id: notificationId } })
    return record ? toSnapshot(record) : null
  }

  async markRead(notificationId: string): Promise<NotificationSnapshot> {
    const record = await prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    })
    return toSnapshot(record)
  }
}

function toSnapshot(record: {
  id: string
  tenantId: string
  userId: string
  category: string
  payload: unknown
  readAt: Date | null
  createdAt: Date
}): NotificationSnapshot {
  return {
    id: record.id,
    tenantId: record.tenantId,
    userId: record.userId,
    category: record.category,
    payload: record.payload as Record<string, unknown>,
    readAt: record.readAt,
    createdAt: record.createdAt,
  }
}
