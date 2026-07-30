export interface NotificationSnapshot {
  id: string
  tenantId: string
  userId: string
  category: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
}

export interface FindPaginatedByUserInput {
  userId: string
  tenantId: string
  page: number
  pageSize: number
  unreadOnly: boolean
}

export interface PaginatedNotifications {
  items: NotificationSnapshot[]
  total: number
}

export interface NotificationRepository {
  findPaginatedByUser(input: FindPaginatedByUserInput): Promise<PaginatedNotifications>
  findById(notificationId: string): Promise<NotificationSnapshot | null>
  markRead(notificationId: string): Promise<NotificationSnapshot>
}
