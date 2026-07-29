import { IsSubscriptionActiveSpecification } from "./IsSubscriptionActiveSpecification"

describe("IsSubscriptionActiveSpecification", () => {
  const spec = new IsSubscriptionActiveSpecification()

  it.each(["ACTIVE", "TRIAL"] as const)("should accept %s", (status) => {
    expect(spec.isSatisfiedBy(status)).toBe(true)
  })

  it.each(["PAST_DUE", "CANCELED"] as const)("should reject %s", (status) => {
    expect(spec.isSatisfiedBy(status)).toBe(false)
  })
})
