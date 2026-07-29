import { PlanNotFoundError } from "./PlanNotFoundError"

describe("PlanNotFoundError", () => {
  it("should carry a descriptive message and name", () => {
    const error = new PlanNotFoundError("plan-1")

    expect(error.message).toBe('Plan not found: "plan-1"')
    expect(error.name).toBe("PlanNotFoundError")
  })
})
