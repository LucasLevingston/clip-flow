import type { SocialAccountPlatform } from "../types"

export interface OAuthExchangeResult {
  externalAccountId: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
  refreshExpiresAt: Date | null
}

export interface OAuthRefreshResult {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
}

export interface SocialOAuthAdapter {
  getAuthorizationUrl(state: string): string
  exchangeCode(code: string): Promise<OAuthExchangeResult>
  refreshAccessToken(refreshToken: string): Promise<OAuthRefreshResult>
}

/** Only platforms with a registered adapter are connectable. */
export type SocialOAuthAdapterRegistry = Partial<Record<SocialAccountPlatform, SocialOAuthAdapter>>
