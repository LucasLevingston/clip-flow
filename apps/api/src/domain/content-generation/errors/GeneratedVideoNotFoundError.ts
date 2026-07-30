export class GeneratedVideoNotFoundError extends Error {
  constructor(generatedVideoId: string) {
    super(`GeneratedVideo ${generatedVideoId} not found`)
    this.name = "GeneratedVideoNotFoundError"
  }
}
