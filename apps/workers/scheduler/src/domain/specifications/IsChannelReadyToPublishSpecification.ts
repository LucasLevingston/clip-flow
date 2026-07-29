import type { ChannelPlatforms, SocialAccountPlatform } from "../types"

function requiredPlatforms(platforms: ChannelPlatforms): SocialAccountPlatform[] {
  if (platforms === "BOTH") return ["YOUTUBE", "TIKTOK"]
  if (platforms === "SHORTS_ONLY") return ["YOUTUBE"]
  return ["TIKTOK"]
}

/** Pre-condition 3/4 — mirrors the API's copy (ADR-0011); each worker keeps its own domain layer. */
export class IsChannelReadyToPublishSpecification {
  isSatisfiedBy(platforms: ChannelPlatforms, connectedPlatforms: SocialAccountPlatform[]): boolean {
    return requiredPlatforms(platforms).every((platform) => connectedPlatforms.includes(platform))
  }
}
