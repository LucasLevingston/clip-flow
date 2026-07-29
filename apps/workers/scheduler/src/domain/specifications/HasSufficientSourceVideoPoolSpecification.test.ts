import { HasSufficientSourceVideoPoolSpecification } from "./HasSufficientSourceVideoPoolSpecification"

describe("HasSufficientSourceVideoPoolSpecification", () => {
  const spec = new HasSufficientSourceVideoPoolSpecification()

  it("should be satisfied when the pool covers the required count", () => {
    expect(spec.isSatisfiedBy(5, 3)).toBe(true)
    expect(spec.isSatisfiedBy(3, 3)).toBe(true)
  })

  it("should not be satisfied when the pool is short", () => {
    expect(spec.isSatisfiedBy(2, 3)).toBe(false)
  })
})
