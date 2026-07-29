import { IsChannelActiveSpecification } from "./IsChannelActiveSpecification"

describe("IsChannelActiveSpecification", () => {
  const spec = new IsChannelActiveSpecification()

  it("should accept ACTIVE", () => {
    expect(spec.isSatisfiedBy("ACTIVE")).toBe(true)
  })

  it.each(["DRAFT", "PAUSED"] as const)("should reject %s", (status) => {
    expect(spec.isSatisfiedBy(status)).toBe(false)
  })
})
