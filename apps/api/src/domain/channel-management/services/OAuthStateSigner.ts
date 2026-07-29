export interface OAuthStatePayload {
  tenantId: string
  channelId: string
  platform: string
}

/** Self-contained anti-CSRF state token — no server-side storage needed to verify it. */
export interface OAuthStateSigner {
  sign(payload: OAuthStatePayload): string
  verify(token: string): OAuthStatePayload | null
}
