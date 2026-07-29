import { acceptInvitationSchema } from "./acceptInvitationSchema"

describe("acceptInvitationSchema", () => {
  it("should accept a valid tenantId", () => {
    expect(acceptInvitationSchema.parse({ tenantId: "tenant-1" })).toEqual({ tenantId: "tenant-1" })
  })

  it("should reject an empty tenantId", () => {
    expect(() => acceptInvitationSchema.parse({ tenantId: "" })).toThrow()
  })

  it("should reject a missing tenantId", () => {
    expect(() => acceptInvitationSchema.parse({})).toThrow()
  })
})
