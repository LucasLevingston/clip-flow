import { buildDailyCronPattern } from "./buildDailyCronPattern"

describe("buildDailyCronPattern", () => {
  it("should build a daily cron pattern from an HH:mm time", () => {
    expect(buildDailyCronPattern("06:00")).toBe("00 06 * * *")
  })

  it("should preserve minutes and hours exactly", () => {
    expect(buildDailyCronPattern("23:45")).toBe("45 23 * * *")
  })
})
