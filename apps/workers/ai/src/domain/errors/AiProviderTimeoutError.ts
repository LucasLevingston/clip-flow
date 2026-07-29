export class AiProviderTimeoutError extends Error {
  constructor(provider: string) {
    super(`${provider} timed out`)
    this.name = "AiProviderTimeoutError"
  }
}
