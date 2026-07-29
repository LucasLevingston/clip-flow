import type { SocialAccount } from "../entities/SocialAccount"
import type { SocialAccountPlatform } from "../types"

export interface SocialAccountRepository {
  findByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccount | null>
  findByChannelId(channelId: string): Promise<SocialAccount[]>
  save(account: SocialAccount): Promise<void>
}
