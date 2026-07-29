import type { SocialAccountReadRepository } from "../domain/repositories/SocialAccountReadRepository"
import type { SocialAccountPlatform } from "../domain/types"

export class FakeSocialAccountReadRepository implements SocialAccountReadRepository {
  private readonly platformsByChannelId = new Map<string, SocialAccountPlatform[]>()

  seed(channelId: string, platforms: SocialAccountPlatform[]): void {
    this.platformsByChannelId.set(channelId, platforms)
  }

  findConnectedPlatformsByChannelId(channelId: string): Promise<SocialAccountPlatform[]> {
    return Promise.resolve(this.platformsByChannelId.get(channelId) ?? [])
  }
}
