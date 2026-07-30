export interface CreateNotificationInput {
  tenantId: string
  userId: string
  category: string
  payload: Record<string, unknown>
}

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<void>
}
