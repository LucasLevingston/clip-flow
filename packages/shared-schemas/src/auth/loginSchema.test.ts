import { loginSchema } from "./loginSchema"

describe("loginSchema", () => {
  it("should accept a valid payload", () => {
    const result = loginSchema.parse({ email: "a@b.com", password: "anything" })

    expect(result).toEqual({ email: "a@b.com", password: "anything" })
  })

  it("should reject an empty password", () => {
    expect(() => loginSchema.parse({ email: "a@b.com", password: "" })).toThrow()
  })

  it("should reject an invalid e-mail", () => {
    expect(() => loginSchema.parse({ email: "nope", password: "x" })).toThrow()
  })
})
