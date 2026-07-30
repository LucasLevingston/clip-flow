import type {
  CreateNotificationInput,
  NotificationRepository,
} from "../domain/repositories/NotificationRepository"

export class FakeNotificationRepository implements NotificationRepository {
  readonly created: CreateNotificationInput[] = []

  create(input: CreateNotificationInput): Promise<void> {
    this.created.push(input)
    return Promise.resolve()
  }
}
