import { changeChannelStatusSchema } from "./changeChannelStatusSchema"

describe("changeChannelStatusSchema", () => {
  it("should accept ACTIVE and PAUSED", () => {
    expect(() => changeChannelStatusSchema.parse({ status: "ACTIVE" })).not.toThrow()
    expect(() => changeChannelStatusSchema.parse({ status: "PAUSED" })).not.toThrow()
  })

  it("should reject DRAFT (not a valid target status)", () => {
    expect(() => changeChannelStatusSchema.parse({ status: "DRAFT" })).toThrow()
  })
})
