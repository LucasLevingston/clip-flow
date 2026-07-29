let current: string | null = null

/**
 * Placeholder in-memory token holder — the real session/auth feature (RF-01/RF-02 login UI)
 * has not landed in `apps/web` yet. `apiClient` depends on this abstraction, not on how the
 * token ends up here, so swapping in real session storage later needs no changes downstream.
 */
export const authToken = {
  get(): string | null {
    return current
  },
  set(token: string | null): void {
    current = token
  },
}
