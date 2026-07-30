import type { NotificationRepository } from "../../../domain/notifications/repositories/NotificationRepository"

export interface ListNotificationsInput {
  userId: string
  tenantId: string
  page: number
  pageSize: number
  unreadOnly: boolean
}

export interface NotificationDto {
  id: string
  category: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
}

export interface ListNotificationsOutput {
  data: NotificationDto[]
  meta: { page: number; pageSize: number; total: number }
}

export interface ListNotificationsUseCaseDeps {
  notificationRepository: NotificationRepository
}

/** `GET /v1/notifications` — see docs/api/notifications-api.md. */
export class ListNotificationsUseCase {
  constructor(private readonly deps: ListNotificationsUseCaseDeps) {}

  async execute(input: ListNotificationsInput): Promise<ListNotificationsOutput> {
    const { items, total } = await this.deps.notificationRepository.findPaginatedByUser(input)

    return {
      data: items.map((item) => ({
        id: item.id,
        category: item.category,
        payload: item.payload,
        readAt: item.readAt,
        createdAt: item.createdAt,
      })),
      meta: { page: input.page, pageSize: input.pageSize, total },
    }
  }
}
