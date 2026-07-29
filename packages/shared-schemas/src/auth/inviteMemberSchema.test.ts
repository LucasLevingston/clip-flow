import { inviteMemberSchema } from "./inviteMemberSchema"

describe("inviteMemberSchema", () => {
  it("should accept ADMIN and MEMBER roles", () => {
    expect(() => inviteMemberSchema.parse({ email: "a@b.com", role: "ADMIN" })).not.toThrow()
    expect(() => inviteMemberSchema.parse({ email: "a@b.com", role: "MEMBER" })).not.toThrow()
  })

  it("should reject OWNER as an invite role", () => {
    expect(() => inviteMemberSchema.parse({ email: "a@b.com", role: "OWNER" })).toThrow()
  })

  it("should reject an invalid e-mail", () => {
    expect(() => inviteMemberSchema.parse({ email: "nope", role: "MEMBER" })).toThrow()
  })
})
