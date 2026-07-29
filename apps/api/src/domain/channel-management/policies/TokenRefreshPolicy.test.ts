import { TokenRefreshPolicy } from "./TokenRefreshPolicy"

describe("TokenRefreshPolicy", () => {
  const policy = new TokenRefreshPolicy()
  const now = new Date("2026-01-01T00:00:00Z")

  it("should not refresh when more than 10 minutes remain", () => {
    const expiresAt = new Date(now.getTime() + 11 * 60 * 1000)

    expect(policy.shouldRefresh(expiresAt, now)).toBe(false)
  })

  it("should refresh when less than 10 minutes remain", () => {
    const expiresAt = new Date(now.getTime() + 9 * 60 * 1000)

    expect(policy.shouldRefresh(expiresAt, now)).toBe(true)
  })

  it("should refresh when the token has already expired", () => {
    const expiresAt = new Date(now.getTime() - 1000)

    expect(policy.shouldRefresh(expiresAt, now)).toBe(true)
  })
})
