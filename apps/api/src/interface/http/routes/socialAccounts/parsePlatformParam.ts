import type { SocialAccountPlatform } from "../../../../domain/channel-management/types"

const SUPPORTED_PLATFORMS: Record<string, SocialAccountPlatform> = {
  youtube: "YOUTUBE",
  tiktok: "TIKTOK",
}

export function parsePlatformParam(platform: string): SocialAccountPlatform | null {
  return SUPPORTED_PLATFORMS[platform] ?? null
}
