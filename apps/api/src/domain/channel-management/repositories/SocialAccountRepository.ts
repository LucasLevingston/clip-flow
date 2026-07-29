import type { SocialAccount } from "../entities/SocialAccount"
import type { SocialAccountPlatform } from "../types"

export interface SocialAccountRepository {
  findById(id: string): Promise<SocialAccount | null>
  findByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccount | null>
  findByChannelId(channelId: string): Promise<SocialAccount[]>
  save(account: SocialAccount): Promise<void>
  delete(id: string): Promise<void>
}
