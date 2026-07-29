export class SourceVideoNotFoundError extends Error {
  constructor(sourceVideoId: string) {
    super(`Source video not found: "${sourceVideoId}"`)
    this.name = "SourceVideoNotFoundError"
  }
}
