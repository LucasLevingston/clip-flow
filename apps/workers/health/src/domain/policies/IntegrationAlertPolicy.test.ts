import { shouldAlertIntegrationDegraded } from "./IntegrationAlertPolicy"

describe("shouldAlertIntegrationDegraded", () => {
  it("should return false under 3 consecutive failures", () => {
    expect(shouldAlertIntegrationDegraded(2)).toBe(false)
  })

  it("should return true at exactly 3 consecutive failures", () => {
    expect(shouldAlertIntegrationDegraded(3)).toBe(true)
  })

  it("should return true above 3 consecutive failures", () => {
    expect(shouldAlertIntegrationDegraded(7)).toBe(true)
  })
})
