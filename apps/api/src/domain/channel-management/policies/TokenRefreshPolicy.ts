const REFRESH_THRESHOLD_MS = 10 * 60 * 1000

/** Decides proactive renewal (<10min left) — see security/secrets-encryption.md. Consumed lazily by whoever uses the token, never a dedicated worker. */
export class TokenRefreshPolicy {
  shouldRefresh(accessTokenExpiresAt: Date, now: Date): boolean {
    return accessTokenExpiresAt.getTime() - now.getTime() < REFRESH_THRESHOLD_MS
  }
}
