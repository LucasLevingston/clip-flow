import { shouldRefreshToken } from "./TokenRefreshPolicy"

describe("shouldRefreshToken", () => {
  it("should not refresh when more than 10 minutes remain", () => {
    const now = new Date("2026-07-30T12:00:00Z")
    const expiresAt = new Date("2026-07-30T12:15:00Z")

    expect(shouldRefreshToken(expiresAt, now)).toBe(false)
  })

  it("should refresh when fewer than 10 minutes remain", () => {
    const now = new Date("2026-07-30T12:00:00Z")
    const expiresAt = new Date("2026-07-30T12:05:00Z")

    expect(shouldRefreshToken(expiresAt, now)).toBe(true)
  })

  it("should refresh when the token already expired", () => {
    const now = new Date("2026-07-30T12:00:00Z")
    const expiresAt = new Date("2026-07-30T11:00:00Z")

    expect(shouldRefreshToken(expiresAt, now)).toBe(true)
  })
})
