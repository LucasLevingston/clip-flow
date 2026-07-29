import type { SocialOAuthAdapterRegistry } from "../../domain/channel-management/services/SocialOAuthAdapter"
import { TiktokOAuthAdapter } from "../oauth/TiktokOAuthAdapter"
import { YoutubeOAuthAdapter } from "../oauth/YoutubeOAuthAdapter"

/** Wires the real YouTube + TikTok OAuth adapters from environment variables. */
export function buildSocialOAuthAdapterRegistry(): SocialOAuthAdapterRegistry {
  return {
    YOUTUBE: new YoutubeOAuthAdapter({
      clientId: process.env.YOUTUBE_CLIENT_ID ?? "",
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
      redirectUri: process.env.YOUTUBE_REDIRECT_URI ?? "",
    }),
    TIKTOK: new TiktokOAuthAdapter({
      clientKey: process.env.TIKTOK_CLIENT_KEY ?? "",
      clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
      redirectUri: process.env.TIKTOK_REDIRECT_URI ?? "",
    }),
  }
}
