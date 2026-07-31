import { updateNicheSchema } from "./updateNicheSchema"

describe("updateNicheSchema", () => {
  it("should accept an empty patch", () => {
    expect(updateNicheSchema.parse({})).toEqual({})
  })

  it("should accept a partial patch", () => {
    expect(updateNicheSchema.parse({ status: "ACTIVE" })).toEqual({ status: "ACTIVE" })
  })

  it("should reject an invalid status", () => {
    expect(() => updateNicheSchema.parse({ status: "DRAFT" })).toThrow()
  })
})
