import { HasSufficientHistoryForInsightsSpecification } from "./HasSufficientHistoryForInsightsSpecification"

describe("HasSufficientHistoryForInsightsSpecification", () => {
  const spec = new HasSufficientHistoryForInsightsSpecification()

  it("should be satisfied at or above the minimum published video count", () => {
    expect(spec.isSatisfiedBy(5)).toBe(true)
    expect(spec.isSatisfiedBy(10)).toBe(true)
  })

  it("should not be satisfied below the minimum", () => {
    expect(spec.isSatisfiedBy(4)).toBe(false)
    expect(spec.isSatisfiedBy(0)).toBe(false)
  })
})
