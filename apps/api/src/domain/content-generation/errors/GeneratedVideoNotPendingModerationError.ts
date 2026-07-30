export class GeneratedVideoNotPendingModerationError extends Error {
  constructor(generatedVideoId: string) {
    super(`GeneratedVideo ${generatedVideoId} is not pending moderation`)
    this.name = "GeneratedVideoNotPendingModerationError"
  }
}
