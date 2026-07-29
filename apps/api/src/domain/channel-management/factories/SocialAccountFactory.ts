import { SocialAccount } from "../entities/SocialAccount"
import type { DecryptedTokens, TokenEncryptor } from "../services/TokenEncryptor"
import type { SocialAccountPlatform } from "../types"

export interface SocialAccountFactoryInput {
  id: string
  channelId: string
  platform: SocialAccountPlatform
  externalAccountId: string
  tokens: DecryptedTokens
  refreshExpiresAt: Date | null
}

/** Creates a CONNECTED SocialAccount from an OAuth callback, encrypting tokens before persisting. */
export class SocialAccountFactory {
  constructor(private readonly tokenEncryptor: TokenEncryptor) {}

  create(input: SocialAccountFactoryInput): SocialAccount {
    const encrypted = this.tokenEncryptor.encrypt(input.tokens)

    return SocialAccount.create({
      id: input.id,
      channelId: input.channelId,
      platform: input.platform,
      externalAccountId: input.externalAccountId,
      status: "CONNECTED",
      encryptedTokens: encrypted.ciphertext,
      tokenKeyVersion: encrypted.keyVersion,
      refreshExpiresAt: input.refreshExpiresAt,
      createdAt: new Date(),
    })
  }
}
