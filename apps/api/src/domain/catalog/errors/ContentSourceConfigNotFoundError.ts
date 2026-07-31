export class ContentSourceConfigNotFoundError extends Error {
  constructor(contentSourceConfigId: string) {
    super(`Content source config not found: "${contentSourceConfigId}"`)
    this.name = "ContentSourceConfigNotFoundError"
  }
}
