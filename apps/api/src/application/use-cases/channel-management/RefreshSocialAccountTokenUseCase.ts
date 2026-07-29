import { SocialAccountNotFoundError } from "../../../domain/channel-management/errors/SocialAccountNotFoundError"
import type { SocialAccountRepository } from "../../../domain/channel-management/repositories/SocialAccountRepository"
import type { TokenEncryptor } from "../../../domain/channel-management/services/TokenEncryptor"
import type { SocialOAuthAdapterRegistry } from "../../../domain/channel-management/services/SocialOAuthAdapter"
import type { SocialAccountStatus } from "../../../domain/channel-management/types"
import type { TokenRefreshPolicy } from "../../../domain/channel-management/policies/TokenRefreshPolicy"
import type { Clock } from "../../../domain/identity/services/Clock"

export interface RefreshSocialAccountTokenInput {
  socialAccountId: string
}

export interface RefreshSocialAccountTokenUseCaseDeps {
  socialAccountRepository: SocialAccountRepository
  tokenEncryptor: TokenEncryptor
  oauthAdapters: SocialOAuthAdapterRegistry
  tokenRefreshPolicy: TokenRefreshPolicy
  clock: Clock
}

/** ISSUE-04.F3.S1.T1 — silent renewal, consumed lazily by whoever needs a valid token next. */
export class RefreshSocialAccountTokenUseCase {
  constructor(private readonly deps: RefreshSocialAccountTokenUseCaseDeps) {}

  async execute(input: RefreshSocialAccountTokenInput): Promise<SocialAccountStatus> {
    const account = await this.deps.socialAccountRepository.findById(input.socialAccountId)
    if (!account) {
      throw new SocialAccountNotFoundError(input.socialAccountId)
    }

    const decrypted = this.deps.tokenEncryptor.decrypt({
      ciphertext: account.encryptedTokens,
      keyVersion: account.tokenKeyVersion,
    })
    const expiresAt = new Date(decrypted.accessTokenExpiresAt)
    if (!this.deps.tokenRefreshPolicy.shouldRefresh(expiresAt, this.deps.clock.now())) {
      return account.status
    }

    const adapter = this.deps.oauthAdapters[account.platform]
    if (!adapter) {
      throw new Error(`No OAuth adapter registered for platform "${account.platform}"`)
    }

    try {
      const refreshed = await adapter.refreshAccessToken(decrypted.refreshToken)
      const encrypted = this.deps.tokenEncryptor.encrypt({
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        accessTokenExpiresAt: refreshed.accessTokenExpiresAt.toISOString(),
      })
      const updated = account.withRefreshedTokens(encrypted.ciphertext, encrypted.keyVersion)
      await this.deps.socialAccountRepository.save(updated)
      return updated.status
    } catch {
      const needsReauth = account.markNeedsReauth()
      await this.deps.socialAccountRepository.save(needsReauth)
      return needsReauth.status
    }
  }
}
