import type { SocialAccountPlatform } from "../types"

export interface SocialAccountSnapshot {
  id: string
  platform: SocialAccountPlatform
  encryptedTokens: Buffer
  tokenKeyVersion: number
}

export interface SocialAccountRepository {
  findById(socialAccountId: string): Promise<SocialAccountSnapshot | null>
  updateTokens(
    socialAccountId: string,
    encryptedTokens: Buffer,
    tokenKeyVersion: number,
  ): Promise<void>
  markNeedsReauth(socialAccountId: string): Promise<void>
}
