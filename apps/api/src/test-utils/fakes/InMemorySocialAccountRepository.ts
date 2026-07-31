import type { SocialAccount } from "../../domain/channel-management/entities/SocialAccount"
import type { SocialAccountRepository } from "../../domain/channel-management/repositories/SocialAccountRepository"
import type { SocialAccountPlatform } from "../../domain/channel-management/types"

export class InMemorySocialAccountRepository implements SocialAccountRepository {
  private readonly accountsById = new Map<string, SocialAccount>()

  findById(id: string): Promise<SocialAccount | null> {
    return Promise.resolve(this.accountsById.get(id) ?? null)
  }

  findByIdAndChannel(id: string, channelId: string): Promise<SocialAccount | null> {
    const account = this.accountsById.get(id)
    return Promise.resolve(account && account.channelId === channelId ? account : null)
  }

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

  // channelId scoping is a real Prisma-level guarantee (see SocialAccountPrismaRepository);
  // callers only ever reach delete() with an already-ownership-verified account, so the fake
  // doesn't need to re-simulate that branch.
  delete(id: string, _channelId: string): Promise<void> {
    this.accountsById.delete(id)
    return Promise.resolve()
  }
}
