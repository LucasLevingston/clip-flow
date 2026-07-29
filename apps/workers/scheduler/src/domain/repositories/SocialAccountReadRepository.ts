import type { SocialAccountPlatform } from "../types"

export interface SocialAccountReadRepository {
  findConnectedPlatformsByChannelId(channelId: string): Promise<SocialAccountPlatform[]>
}
