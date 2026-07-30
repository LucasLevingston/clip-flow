export class ObjectStorageError extends Error {
  constructor(details: string) {
    super(`Object storage operation failed: ${details}`)
    this.name = "ObjectStorageError"
  }
}
