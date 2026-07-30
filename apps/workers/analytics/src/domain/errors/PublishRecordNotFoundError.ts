export class PublishRecordNotFoundError extends Error {
  constructor(publishRecordId: string) {
    super(`PublishRecord ${publishRecordId} not found`)
    this.name = "PublishRecordNotFoundError"
  }
}
