import type { SocialAccountPlatform } from "../../../../domain/channel-management/types"

const SUPPORTED_PLATFORMS: Record<string, SocialAccountPlatform> = {
  youtube: "YOUTUBE",
}

/** TikTok lands in EPIC-04.F2 — the URL still uses the documented `:platform` shape. */
export function parsePlatformParam(platform: string): SocialAccountPlatform | null {
  return SUPPORTED_PLATFORMS[platform] ?? null
}
