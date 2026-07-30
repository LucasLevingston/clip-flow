import type {
  SocialAccountRepository,
  SocialAccountSnapshot,
} from "../domain/repositories/SocialAccountRepository"
import type { SocialAccountPlatform } from "../domain/types"

export class FakeSocialAccountRepository implements SocialAccountRepository {
  private readonly accountsById = new Map<string, SocialAccountSnapshot>()
  readonly needsReauthIds: string[] = []
  readonly updatedTokens: { id: string; encryptedTokens: Buffer; tokenKeyVersion: number }[] = []

  seed(account: SocialAccountSnapshot): void {
    this.accountsById.set(account.id, account)
  }

  findConnectedByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccountSnapshot | null> {
    const found = [...this.accountsById.values()].find(
      (account) => account.channelId === channelId && account.platform === platform,
    )
    return Promise.resolve(found ?? null)
  }

  updateTokens(id: string, encryptedTokens: Buffer, tokenKeyVersion: number): Promise<void> {
    this.updatedTokens.push({ id, encryptedTokens, tokenKeyVersion })
    const existing = this.accountsById.get(id)
    if (existing) {
      this.accountsById.set(id, { ...existing, encryptedTokens, tokenKeyVersion })
    }
    return Promise.resolve()
  }

  markNeedsReauth(id: string): Promise<void> {
    this.needsReauthIds.push(id)
    return Promise.resolve()
  }
}
