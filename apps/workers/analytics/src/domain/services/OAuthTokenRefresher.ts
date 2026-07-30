import type { SocialAccountPlatform } from "../types"

export interface OAuthRefreshResult {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: Date
}

export interface OAuthTokenRefresher {
  refreshAccessToken(refreshToken: string): Promise<OAuthRefreshResult>
}

export type OAuthTokenRefresherRegistry = Partial<
  Record<SocialAccountPlatform, OAuthTokenRefresher>
>
