export class NotificationNotFoundError extends Error {
  constructor(notificationId: string) {
    super(`Notification ${notificationId} not found`)
    this.name = "NotificationNotFoundError"
  }
}
