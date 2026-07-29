import { allocateScheduledPublishTimes } from "./allocateScheduledPublishTimes"

describe("allocateScheduledPublishTimes", () => {
  it("should project each HH:mm onto the reference date's UTC day", () => {
    const referenceDate = new Date("2026-07-29T06:00:00Z")

    const result = allocateScheduledPublishTimes(["09:00", "18:30"], referenceDate)

    expect(result.map((d) => d.toISOString())).toEqual([
      "2026-07-29T09:00:00.000Z",
      "2026-07-29T18:30:00.000Z",
    ])
  })

  it("should return an empty array for no publish times", () => {
    expect(allocateScheduledPublishTimes([], new Date("2026-07-29T06:00:00Z"))).toEqual([])
  })
})
