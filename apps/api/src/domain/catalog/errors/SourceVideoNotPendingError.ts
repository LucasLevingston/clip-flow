export class SourceVideoNotPendingError extends Error {
  constructor(sourceVideoId: string) {
    super(`Source video "${sourceVideoId}" is not pending review`)
    this.name = "SourceVideoNotPendingError"
  }
}
