const REFRESH_THRESHOLD_MS = 10 * 60 * 1_000

/** Decides proactive renewal (<10min left) — see docs/security/secrets-encryption.md. */
export function shouldRefreshToken(accessTokenExpiresAt: Date, now: Date): boolean {
  return accessTokenExpiresAt.getTime() - now.getTime() < REFRESH_THRESHOLD_MS
}
