import type { SocialAccountPlatform } from "../types"

export interface SocialAccountSnapshot {
  id: string
  channelId: string
  platform: SocialAccountPlatform
  encryptedTokens: Buffer
  tokenKeyVersion: number
}

export interface SocialAccountRepository {
  findConnectedByChannelAndPlatform(
    channelId: string,
    platform: SocialAccountPlatform,
  ): Promise<SocialAccountSnapshot | null>
  updateTokens(
    socialAccountId: string,
    encryptedTokens: Buffer,
    tokenKeyVersion: number,
  ): Promise<void>
  markNeedsReauth(socialAccountId: string): Promise<void>
}
