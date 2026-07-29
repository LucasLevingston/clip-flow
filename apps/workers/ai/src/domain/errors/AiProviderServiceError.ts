export class AiProviderServiceError extends Error {
  constructor(provider: string, statusCode: number) {
    super(`${provider} service error (${statusCode})`)
    this.name = "AiProviderServiceError"
  }
}
