import { shouldRefreshToken } from "../../domain/policies/TokenRefreshPolicy"
import type { SocialAccountSnapshot } from "../../domain/repositories/SocialAccountRepository"
import type { CollectAnalyticsUseCaseDeps } from "./CollectAnalyticsUseCase"

/** Returns a valid access token, refreshing silently when <10min remain (docs/security/secrets-encryption.md). */
export async function resolveAccessToken(
  account: SocialAccountSnapshot,
  deps: CollectAnalyticsUseCaseDeps,
): Promise<string> {
  const decrypted = deps.tokenEncryptor.decrypt({
    ciphertext: account.encryptedTokens,
    keyVersion: account.tokenKeyVersion,
  })
  const expiresAt = new Date(decrypted.accessTokenExpiresAt)
  if (!shouldRefreshToken(expiresAt, deps.clock.now())) {
    return decrypted.accessToken
  }

  const refresher = deps.oauthRefreshers[account.platform]
  if (!refresher) {
    throw new Error(`No OAuth refresher registered for platform "${account.platform}"`)
  }

  let refreshed
  try {
    refreshed = await refresher.refreshAccessToken(decrypted.refreshToken)
  } catch (error) {
    await deps.socialAccountRepository.markNeedsReauth(account.id)
    throw error
  }

  const encrypted = deps.tokenEncryptor.encrypt({
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    accessTokenExpiresAt: refreshed.accessTokenExpiresAt.toISOString(),
  })
  await deps.socialAccountRepository.updateTokens(
    account.id,
    encrypted.ciphertext,
    encrypted.keyVersion,
  )
  return refreshed.accessToken
}
