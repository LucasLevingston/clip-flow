import type { SocialAccount } from "../entities/SocialAccount"
import type { SocialAccountPlatform } from "../types"

export interface SocialAccountRepository {
  /** Unscoped — only for trusted internal flows (e.g. lazy token refresh) that already hold the account id, never for a route param without a caller-side ownership check. */
  findById(id: string): Promise<SocialAccount | null>
  /** Scoped by channelId at the query level — use this from any tenant-facing route. */
  findByIdAndChannel(id: string, channelId: string): Promise<SocialAccount | null>
  findByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccount | null>
  findByChannelId(channelId: string): Promise<SocialAccount[]>
  save(account: SocialAccount): Promise<void>
  delete(id: string, channelId: string): Promise<void>
}
