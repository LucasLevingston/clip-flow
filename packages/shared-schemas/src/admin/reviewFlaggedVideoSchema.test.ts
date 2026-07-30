import { reviewFlaggedVideoSchema } from "./reviewFlaggedVideoSchema"

describe("reviewFlaggedVideoSchema", () => {
  it("should accept a decision without a reason", () => {
    expect(() => reviewFlaggedVideoSchema.parse({ decision: "APPROVED" })).not.toThrow()
  })

  it("should accept a decision with a reason", () => {
    const result = reviewFlaggedVideoSchema.parse({ decision: "REJECTED", reason: "Still unsafe" })
    expect(result.reason).toBe("Still unsafe")
  })

  it("should reject an invalid decision", () => {
    expect(() => reviewFlaggedVideoSchema.parse({ decision: "MAYBE" })).toThrow()
  })
})
