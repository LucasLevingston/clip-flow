export class AiProviderInvalidResponseError extends Error {
  constructor(provider: string) {
    super(`${provider} returned a response outside the expected schema`)
    this.name = "AiProviderInvalidResponseError"
  }
}
