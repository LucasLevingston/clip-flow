export class OAuthExchangeFailedError extends Error {
  constructor(reason: string) {
    super(`OAuth code exchange failed: ${reason}`)
    this.name = "OAuthExchangeFailedError"
  }
}
