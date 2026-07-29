export class InvalidHighlightSelectionError extends Error {
  constructor(durationMs: number) {
    super(`Highlight duration must be between 15s and 90s, got ${durationMs}ms`)
    this.name = "InvalidHighlightSelectionError"
  }
}
