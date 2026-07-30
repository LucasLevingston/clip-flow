import type { ChannelPlatforms, SocialAccountPlatform } from "../types"

/** Pure — no I/O. `BOTH` mirrors the same finalAssetUrl to both platforms (docs/architecture/upload-flow.md). */
export function resolveTargetPlatforms(platforms: ChannelPlatforms): SocialAccountPlatform[] {
  if (platforms === "BOTH") {
    return ["YOUTUBE", "TIKTOK"]
  }
  return platforms === "SHORTS_ONLY" ? ["YOUTUBE"] : ["TIKTOK"]
}
