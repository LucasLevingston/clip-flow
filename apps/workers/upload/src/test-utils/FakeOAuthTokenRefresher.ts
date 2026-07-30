import type {
  OAuthRefreshResult,
  OAuthTokenRefresher,
} from "../domain/services/OAuthTokenRefresher"

export class FakeOAuthTokenRefresher implements OAuthTokenRefresher {
  calls: string[] = []
  resultToReturn: OAuthRefreshResult = {
    accessToken: "refreshed-access-token",
    refreshToken: "refreshed-refresh-token",
    accessTokenExpiresAt: new Date(Date.now() + 3_600_000),
  }
  errorToThrow: Error | null = null

  refreshAccessToken(refreshToken: string): Promise<OAuthRefreshResult> {
    this.calls.push(refreshToken)
    if (this.errorToThrow) {
      return Promise.reject(this.errorToThrow)
    }
    return Promise.resolve(this.resultToReturn)
  }
}
