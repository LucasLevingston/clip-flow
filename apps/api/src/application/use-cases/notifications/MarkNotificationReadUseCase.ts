import { NotificationNotFoundError } from "../../../domain/notifications/errors/NotificationNotFoundError"
import type {
  NotificationRepository,
  NotificationSnapshot,
} from "../../../domain/notifications/repositories/NotificationRepository"

export interface MarkNotificationReadInput {
  userId: string
  notificationId: string
}

export interface MarkNotificationReadUseCaseDeps {
  notificationRepository: NotificationRepository
}

/** `PATCH /v1/notifications/:id/read` — see docs/api/notifications-api.md. */
export class MarkNotificationReadUseCase {
  constructor(private readonly deps: MarkNotificationReadUseCaseDeps) {}

  async execute(input: MarkNotificationReadInput): Promise<NotificationSnapshot> {
    const notification = await this.deps.notificationRepository.findById(input.notificationId)
    if (!notification || notification.userId !== input.userId) {
      throw new NotificationNotFoundError(input.notificationId)
    }

    return this.deps.notificationRepository.markRead(input.notificationId)
  }
}
