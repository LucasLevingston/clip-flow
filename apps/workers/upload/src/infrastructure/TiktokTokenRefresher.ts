import { OAuthRefreshFailedError } from "../domain/errors/OAuthRefreshFailedError"
import type {
  OAuthRefreshResult,
  OAuthTokenRefresher,
} from "../domain/services/OAuthTokenRefresher"

const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"

interface TiktokTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface TiktokTokenRefresherConfig {
  clientKey: string
  clientSecret: string
}

/** Silent renewal only — see docs/integrations/tiktok.md. */
export class TiktokTokenRefresher implements OAuthTokenRefresher {
  constructor(private readonly config: TiktokTokenRefresherConfig) {}

  async refreshAccessToken(refreshToken: string): Promise<OAuthRefreshResult> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_key: this.config.clientKey,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
      }),
    })
    if (!response.ok) {
      throw new OAuthRefreshFailedError("TikTok", response.status)
    }
    const body = (await response.json()) as TiktokTokenResponse
    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      accessTokenExpiresAt: new Date(Date.now() + body.expires_in * 1_000),
    }
  }
}
