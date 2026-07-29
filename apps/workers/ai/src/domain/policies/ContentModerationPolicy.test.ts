import { shouldFlagForModeration } from "./ContentModerationPolicy"

describe("shouldFlagForModeration", () => {
  it("should not flag when there are no content flags", () => {
    expect(shouldFlagForModeration([])).toBe(false)
  })

  it("should flag when the AI response returned at least one content flag", () => {
    expect(shouldFlagForModeration(["violence"])).toBe(true)
  })
})
