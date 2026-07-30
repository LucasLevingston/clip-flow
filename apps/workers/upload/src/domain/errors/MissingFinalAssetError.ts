export class MissingFinalAssetError extends Error {
  constructor(generatedVideoId: string) {
    super(`GeneratedVideo ${generatedVideoId} has no finalAssetUrl to publish`)
    this.name = "MissingFinalAssetError"
  }
}
