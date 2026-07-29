import { HighlightSelection } from "../value-objects/HighlightSelection"
import { calculateOverlapPercentage } from "./HighlightDiversityService"

describe("calculateOverlapPercentage", () => {
  it("should return 0% for non-overlapping selections", () => {
    const candidate = HighlightSelection.create(0, 20_000, ["seg-1"])
    const other = HighlightSelection.create(20_000, 40_000, ["seg-2"])

    expect(calculateOverlapPercentage(candidate, other)).toBe(0)
  })

  it("should return 20% for a partial overlap", () => {
    const candidate = HighlightSelection.create(0, 20_000, ["seg-1"])
    const other = HighlightSelection.create(16_000, 36_000, ["seg-2"])

    expect(calculateOverlapPercentage(candidate, other)).toBe(20)
  })

  it("should return 41% for a larger partial overlap", () => {
    const candidate = HighlightSelection.create(0, 20_000, ["seg-1"])
    const other = HighlightSelection.create(11_800, 31_800, ["seg-2"])

    expect(calculateOverlapPercentage(candidate, other)).toBe(41)
  })

  it("should return 100% when the candidate is fully contained in the other selection", () => {
    const candidate = HighlightSelection.create(10_000, 30_000, ["seg-1"])
    const other = HighlightSelection.create(0, 40_000, ["seg-2"])

    expect(calculateOverlapPercentage(candidate, other)).toBe(100)
  })
})
