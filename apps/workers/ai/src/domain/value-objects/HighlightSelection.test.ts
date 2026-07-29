import { InvalidHighlightSelectionError } from "../errors/InvalidHighlightSelectionError"
import { HighlightSelection } from "./HighlightSelection"

describe("HighlightSelection", () => {
  it("should create a highlight selection within the 15-90s window", () => {
    const highlight = HighlightSelection.create(1_000, 31_000, ["seg-1", "seg-2"])

    expect(highlight.startMs).toBe(1_000)
    expect(highlight.endMs).toBe(31_000)
    expect(highlight.transcriptSegmentIds).toEqual(["seg-1", "seg-2"])
  })

  it("should reject a selection shorter than 15s", () => {
    expect(() => HighlightSelection.create(0, 14_999, ["seg-1"])).toThrow(
      InvalidHighlightSelectionError,
    )
  })

  it("should reject a selection longer than 90s", () => {
    expect(() => HighlightSelection.create(0, 90_001, ["seg-1"])).toThrow(
      InvalidHighlightSelectionError,
    )
  })

  it("should accept the exact boundary durations", () => {
    expect(() => HighlightSelection.create(0, 15_000, ["seg-1"])).not.toThrow()
    expect(() => HighlightSelection.create(0, 90_000, ["seg-1"])).not.toThrow()
  })
})
