export class HighlightNotDiverseEnoughError extends Error {
  constructor(sourceVideoId: string) {
    super(
      `Selected highlight for source video ${sourceVideoId} overlaps too much with other channels' selections`,
    )
    this.name = "HighlightNotDiverseEnoughError"
  }
}
