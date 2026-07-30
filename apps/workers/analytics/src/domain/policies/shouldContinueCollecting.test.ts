import { shouldContinueCollecting } from "./shouldContinueCollecting"

describe("shouldContinueCollecting", () => {
  it("should continue when the post is within the 30-day window", () => {
    const publishedAt = new Date("2026-07-01T00:00:00Z")
    const now = new Date("2026-07-10T00:00:00Z")
    expect(shouldContinueCollecting(publishedAt, now)).toBe(true)
  })

  it("should stop once 30 days have elapsed", () => {
    const publishedAt = new Date("2026-06-01T00:00:00Z")
    const now = new Date("2026-07-02T00:00:00Z")
    expect(shouldContinueCollecting(publishedAt, now)).toBe(false)
  })

  it("should stop exactly at the 30-day boundary", () => {
    const publishedAt = new Date("2026-07-01T00:00:00Z")
    const now = new Date("2026-07-31T00:00:00Z")
    expect(shouldContinueCollecting(publishedAt, now)).toBe(false)
  })
})
