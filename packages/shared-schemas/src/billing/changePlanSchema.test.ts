import { changePlanSchema } from "./changePlanSchema"

describe("changePlanSchema", () => {
  it("should accept a valid planId", () => {
    expect(changePlanSchema.parse({ planId: "plan-1" })).toEqual({ planId: "plan-1" })
  })

  it("should reject an empty planId", () => {
    expect(() => changePlanSchema.parse({ planId: "" })).toThrow()
  })
})
