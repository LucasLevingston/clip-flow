import type { SocialAccountPlatform } from "./socialAccountsService"

const STORAGE_KEY = "clipflow_oauth_pending"

export interface PendingOAuthConnection {
  channelId: string
  platform: SocialAccountPlatform
  accountId: string | null
}

/** Survives the full-page redirect to the OAuth provider and back (sessionStorage, same tab). */
export const oauthPendingConnection = {
  set(pending: PendingOAuthConnection): void {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
  },
  take(): PendingOAuthConnection | null {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    window.sessionStorage.removeItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PendingOAuthConnection) : null
  },
}
