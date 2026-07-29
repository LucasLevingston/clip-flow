import { reviewSourceVideoSchema } from "./reviewSourceVideoSchema"

describe("reviewSourceVideoSchema", () => {
  it("should accept a decision without a reason", () => {
    expect(() => reviewSourceVideoSchema.parse({ decision: "APPROVED" })).not.toThrow()
  })

  it("should accept a decision with a reason", () => {
    const result = reviewSourceVideoSchema.parse({ decision: "REJECTED", reason: "Low quality" })
    expect(result.reason).toBe("Low quality")
  })

  it("should reject an invalid decision", () => {
    expect(() => reviewSourceVideoSchema.parse({ decision: "MAYBE" })).toThrow()
  })
})
