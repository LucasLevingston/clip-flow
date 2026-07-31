const STORAGE_KEY = "clipflow_access_token"

function readPersisted(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(STORAGE_KEY)
}

let current: string | null = readPersisted()

/** Access token only — the refresh token travels solely as an httpOnly cookie (never in JS). */
export const authToken = {
  get(): string | null {
    return current
  },
  set(token: string | null): void {
    current = token
    if (typeof window === "undefined") return
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  },
}
