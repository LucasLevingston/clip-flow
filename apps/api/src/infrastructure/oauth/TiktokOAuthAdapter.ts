import type {
  OAuthExchangeResult,
  OAuthRefreshResult,
  SocialOAuthAdapter,
} from "../../domain/channel-management/services/SocialOAuthAdapter"
import { requestTiktokToken } from "./requestTiktokToken"

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
const SCOPES = ["user.info.basic", "video.upload", "video.publish"]

export interface TiktokOAuthAdapterConfig {
  clientKey: string
  clientSecret: string
  redirectUri: string
}

/** RF-05 — TikTok Content Posting API OAuth 2.0 Authorization Code flow. See docs/integrations/tiktok.md. */
export class TiktokOAuthAdapter implements SocialOAuthAdapter {
  constructor(private readonly config: TiktokOAuthAdapterConfig) {}

  getAuthorizationUrl(state: string): string {
    const url = new URL(AUTH_URL)
    url.searchParams.set("client_key", this.config.clientKey)
    url.searchParams.set("redirect_uri", this.config.redirectUri)
    url.searchParams.set("response_type", "code")
    url.searchParams.set("scope", SCOPES.join(","))
    url.searchParams.set("state", state)
    return url.toString()
  }

  async exchangeCode(code: string): Promise<OAuthExchangeResult> {
    const tokens = await requestTiktokToken({
      code,
      client_key: this.config.clientKey,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      grant_type: "authorization_code",
    })

    return {
      externalAccountId: tokens.open_id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      refreshExpiresAt: new Date(Date.now() + tokens.refresh_expires_in * 1000),
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthRefreshResult> {
    const tokens = await requestTiktokToken({
      refresh_token: refreshToken,
      client_key: this.config.clientKey,
      client_secret: this.config.clientSecret,
      grant_type: "refresh_token",
    })

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    }
  }
}
