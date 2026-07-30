import { formatSrtTimestamp } from "./formatSrtTimestamp"

describe("formatSrtTimestamp", () => {
  it("should format zero milliseconds", () => {
    expect(formatSrtTimestamp(0)).toBe("00:00:00,000")
  })

  it("should format sub-second milliseconds", () => {
    expect(formatSrtTimestamp(1_234)).toBe("00:00:01,234")
  })

  it("should format hours, minutes and seconds", () => {
    expect(formatSrtTimestamp(3_661_500)).toBe("01:01:01,500")
  })
})
