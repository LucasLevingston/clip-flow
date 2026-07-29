export class RefreshTokenInvalidError extends Error {
  constructor() {
    super("Refresh token is invalid, expired, or revoked")
    this.name = "RefreshTokenInvalidError"
  }
}
