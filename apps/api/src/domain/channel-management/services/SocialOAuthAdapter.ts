import type { SocialAccountPlatform } from "../types"

export interface OAuthExchangeResult {
  externalAccountId: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
  refreshExpiresAt: Date | null
}

export interface SocialOAuthAdapter {
  getAuthorizationUrl(state: string): string
  exchangeCode(code: string): Promise<OAuthExchangeResult>
}

/** Only platforms with a registered adapter are connectable — TikTok lands in EPIC-04.F2. */
export type SocialOAuthAdapterRegistry = Partial<Record<SocialAccountPlatform, SocialOAuthAdapter>>
