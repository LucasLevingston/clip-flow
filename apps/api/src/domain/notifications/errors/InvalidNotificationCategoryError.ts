export class InvalidNotificationCategoryError extends Error {
  constructor(category: string) {
    super(`Invalid notification category: ${category}`)
    this.name = "InvalidNotificationCategoryError"
  }
}
