import type { ChannelPlatforms } from "../entities/Channel"
import type { SocialAccountPlatform } from "../types"

function requiredPlatforms(platforms: ChannelPlatforms): SocialAccountPlatform[] {
  if (platforms === "BOTH") return ["YOUTUBE", "TIKTOK"]
  if (platforms === "SHORTS_ONLY") return ["YOUTUBE"]
  return ["TIKTOK"]
}

/** For every platform `Channel.platforms` requires, a CONNECTED SocialAccount must exist (ADR-0011). */
export class IsChannelReadyToPublishSpecification {
  isSatisfiedBy(platforms: ChannelPlatforms, connectedPlatforms: SocialAccountPlatform[]): boolean {
    return requiredPlatforms(platforms).every((platform) => connectedPlatforms.includes(platform))
  }
}
