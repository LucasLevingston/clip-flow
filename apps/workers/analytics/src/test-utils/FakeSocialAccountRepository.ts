import type {
  SocialAccountRepository,
  SocialAccountSnapshot,
} from "../domain/repositories/SocialAccountRepository"

export class FakeSocialAccountRepository implements SocialAccountRepository {
  private readonly accountsById = new Map<string, SocialAccountSnapshot>()
  readonly needsReauthCalls: string[] = []
  readonly updateTokensCalls: {
    socialAccountId: string
    encryptedTokens: Buffer
    tokenKeyVersion: number
  }[] = []

  seed(account: SocialAccountSnapshot): void {
    this.accountsById.set(account.id, account)
  }

  findById(socialAccountId: string): Promise<SocialAccountSnapshot | null> {
    return Promise.resolve(this.accountsById.get(socialAccountId) ?? null)
  }

  updateTokens(
    socialAccountId: string,
    encryptedTokens: Buffer,
    tokenKeyVersion: number,
  ): Promise<void> {
    this.updateTokensCalls.push({ socialAccountId, encryptedTokens, tokenKeyVersion })
    return Promise.resolve()
  }

  markNeedsReauth(socialAccountId: string): Promise<void> {
    this.needsReauthCalls.push(socialAccountId)
    return Promise.resolve()
  }
}
