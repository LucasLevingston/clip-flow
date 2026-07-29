import { OAuthExchangeFailedError } from "../../domain/channel-management/errors/OAuthExchangeFailedError"
import type {
  OAuthExchangeResult,
  SocialOAuthAdapter,
} from "../../domain/channel-management/services/SocialOAuthAdapter"

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const TOKEN_URL = "https://oauth2.googleapis.com/token"
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
]

export interface YoutubeOAuthAdapterConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

/** RF-05 — YouTube Data API v3 OAuth 2.0 Authorization Code flow. See docs/integrations/youtube.md. */
export class YoutubeOAuthAdapter implements SocialOAuthAdapter {
  constructor(private readonly config: YoutubeOAuthAdapterConfig) {}

  getAuthorizationUrl(state: string): string {
    const url = new URL(AUTH_URL)
    url.searchParams.set("client_id", this.config.clientId)
    url.searchParams.set("redirect_uri", this.config.redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("access_type", "offline")
    url.searchParams.set("prompt", "consent")
    url.searchParams.set("scope", SCOPES.join(" "))
    url.searchParams.set("state", state)
    return url.toString()
  }

  async exchangeCode(code: string): Promise<OAuthExchangeResult> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: "authorization_code",
      }),
    })
    if (!response.ok) {
      throw new OAuthExchangeFailedError(
        `YouTube token exchange returned status ${response.status}`,
      )
    }

    const tokens = (await response.json()) as TokenResponse
    const externalAccountId = await this.fetchExternalAccountId(tokens.access_token)

    return {
      externalAccountId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      refreshExpiresAt: null,
    }
  }

  private async fetchExternalAccountId(accessToken: string): Promise<string> {
    const response = await fetch(USERINFO_URL, {
      headers: { authorization: `Bearer ${accessToken}` },
    })
    if (!response.ok) {
      throw new OAuthExchangeFailedError(
        `Failed to fetch YouTube account info (status ${response.status})`,
      )
    }
    const body = (await response.json()) as { id: string }
    return body.id
  }
}
