import { HighlightSelection } from "../value-objects/HighlightSelection"
import { isDiverseEnough } from "./HighlightDiversityPolicy"

describe("isDiverseEnough", () => {
  it("should accept a candidate with 0% overlap", () => {
    const candidate = HighlightSelection.create(0, 20_000, ["seg-1"])
    const used = HighlightSelection.create(20_000, 40_000, ["seg-2"])

    expect(isDiverseEnough(candidate, [used])).toBe(true)
  })

  it("should accept a candidate with 20% overlap", () => {
    const candidate = HighlightSelection.create(0, 20_000, ["seg-1"])
    const used = HighlightSelection.create(16_000, 36_000, ["seg-2"])

    expect(isDiverseEnough(candidate, [used])).toBe(true)
  })

  it("should reject a candidate with 41% overlap", () => {
    const candidate = HighlightSelection.create(0, 20_000, ["seg-1"])
    const used = HighlightSelection.create(11_800, 31_800, ["seg-2"])

    expect(isDiverseEnough(candidate, [used])).toBe(false)
  })

  it("should reject a candidate with 100% overlap", () => {
    const candidate = HighlightSelection.create(10_000, 30_000, ["seg-1"])
    const used = HighlightSelection.create(0, 40_000, ["seg-2"])

    expect(isDiverseEnough(candidate, [used])).toBe(false)
  })

  it("should accept a candidate when there is nothing used yet", () => {
    const candidate = HighlightSelection.create(0, 20_000, ["seg-1"])

    expect(isDiverseEnough(candidate, [])).toBe(true)
  })
})
