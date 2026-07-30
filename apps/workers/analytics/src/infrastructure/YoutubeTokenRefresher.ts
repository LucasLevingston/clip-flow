import { OAuthRefreshFailedError } from "../domain/errors/OAuthRefreshFailedError"
import type {
  OAuthRefreshResult,
  OAuthTokenRefresher,
} from "../domain/services/OAuthTokenRefresher"

const TOKEN_URL = "https://oauth2.googleapis.com/token"

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

export interface YoutubeTokenRefresherConfig {
  clientId: string
  clientSecret: string
}

/** Silent renewal only — see docs/integrations/youtube.md. */
export class YoutubeTokenRefresher implements OAuthTokenRefresher {
  constructor(private readonly config: YoutubeTokenRefresherConfig) {}

  async refreshAccessToken(refreshToken: string): Promise<OAuthRefreshResult> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: "refresh_token",
      }),
    })
    if (!response.ok) {
      throw new OAuthRefreshFailedError("YouTube", response.status)
    }
    const body = (await response.json()) as GoogleTokenResponse
    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token ?? refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + body.expires_in * 1_000),
    }
  }
}
