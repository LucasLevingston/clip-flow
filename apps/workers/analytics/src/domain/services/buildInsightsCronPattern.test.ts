import { buildInsightsCronPattern } from "./buildInsightsCronPattern"

describe("buildInsightsCronPattern", () => {
  it("should fire 30 minutes before generationTime", () => {
    expect(buildInsightsCronPattern("06:00")).toBe("30 5 * * *")
  })

  it("should handle a generationTime with a non-zero minute", () => {
    expect(buildInsightsCronPattern("09:15")).toBe("45 8 * * *")
  })

  it("should wrap around midnight when generationTime is early in the day", () => {
    expect(buildInsightsCronPattern("00:10")).toBe("40 23 * * *")
  })

  it("should wrap around midnight at exactly 00:00", () => {
    expect(buildInsightsCronPattern("00:00")).toBe("30 23 * * *")
  })
})
