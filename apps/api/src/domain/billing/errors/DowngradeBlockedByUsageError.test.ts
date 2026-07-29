import { DowngradeBlockedByUsageError } from "./DowngradeBlockedByUsageError"

describe("DowngradeBlockedByUsageError", () => {
  it("should carry the exceeding items and a descriptive message", () => {
    const error = new DowngradeBlockedByUsageError(["channels"])

    expect(error.exceeding).toEqual(["channels"])
    expect(error.message).toContain("channels")
    expect(error.name).toBe("DowngradeBlockedByUsageError")
  })
})
