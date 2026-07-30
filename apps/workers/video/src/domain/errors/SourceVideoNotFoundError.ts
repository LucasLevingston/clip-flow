export class SourceVideoNotFoundError extends Error {
  constructor(sourceVideoId: string) {
    super(`SourceVideo ${sourceVideoId} not found`)
    this.name = "SourceVideoNotFoundError"
  }
}
