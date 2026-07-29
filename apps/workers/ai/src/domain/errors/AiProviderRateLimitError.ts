export class AiProviderRateLimitError extends Error {
  constructor(provider: string) {
    super(`${provider} rate limit exceeded`)
    this.name = "AiProviderRateLimitError"
  }
}
