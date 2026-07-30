export class MissingHighlightError extends Error {
  constructor(generatedVideoId: string) {
    super(`GeneratedVideo ${generatedVideoId} has no highlight to cut`)
    this.name = "MissingHighlightError"
  }
}
