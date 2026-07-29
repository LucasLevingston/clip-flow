import type { SocialAccount } from "../../domain/channel-management/entities/SocialAccount"
import type { SocialAccountRepository } from "../../domain/channel-management/repositories/SocialAccountRepository"
import type { SocialAccountPlatform } from "../../domain/channel-management/types"

export class InMemorySocialAccountRepository implements SocialAccountRepository {
  private readonly accountsById = new Map<string, SocialAccount>()

  findByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccount | null> {
    for (const account of this.accountsById.values()) {
      if (account.channelId === channelId && account.platform === platform) {
        return Promise.resolve(account)
      }
    }
    return Promise.resolve(null)
  }

  findByChannelId(channelId: string): Promise<SocialAccount[]> {
    const accounts = [...this.accountsById.values()].filter(
      (account) => account.channelId === channelId,
    )
    return Promise.resolve(accounts)
  }

  save(account: SocialAccount): Promise<void> {
    this.accountsById.set(account.id, account)
    return Promise.resolve()
  }
}
