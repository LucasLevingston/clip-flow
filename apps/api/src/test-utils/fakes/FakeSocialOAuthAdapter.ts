import type {
  OAuthExchangeResult,
  SocialOAuthAdapter,
} from "../../domain/channel-management/services/SocialOAuthAdapter"

const INVALID_CODE = "invalid-code"

export class FakeSocialOAuthAdapter implements SocialOAuthAdapter {
  private counter = 0

  getAuthorizationUrl(state: string): string {
    return `https://oauth.test.local/authorize?state=${encodeURIComponent(state)}`
  }

  exchangeCode(code: string): Promise<OAuthExchangeResult> {
    if (code === INVALID_CODE) {
      return Promise.reject(new Error("invalid_grant"))
    }
    this.counter += 1
    return Promise.resolve({
      externalAccountId: `external-account-${this.counter}`,
      accessToken: `access-token-${this.counter}`,
      refreshToken: `refresh-token-${this.counter}`,
      accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      refreshExpiresAt: null,
    })
  }
}
