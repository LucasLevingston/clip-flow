const REQUIRED_ENV_VARS = [
  "JWT_PRIVATE_KEY",
  "JWT_PUBLIC_KEY",
  "OAUTH_STATE_SECRET",
  "APP_ENCRYPTION_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "YOUTUBE_CLIENT_ID",
  "YOUTUBE_CLIENT_SECRET",
  "YOUTUBE_REDIRECT_URI",
  "TIKTOK_CLIENT_KEY",
  "TIKTOK_CLIENT_SECRET",
  "TIKTOK_REDIRECT_URI",
] as const

/**
 * Every composition-root factory (`createIdentityDeps`, `createSocialAccountDeps`,
 * `createBillingDeps`, `buildSocialOAuthAdapterRegistry`) reads these via `?? ""` —
 * a missing var silently produces a broken-but-running server (empty JWT keys,
 * predictable OAuth state signatures, etc.) instead of a clear boot failure.
 * Called once from `main.ts` before any of those factories run.
 */
export function validateRequiredEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`)
  }
}
