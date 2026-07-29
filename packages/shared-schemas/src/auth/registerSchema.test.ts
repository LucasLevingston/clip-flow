import { registerSchema } from "./registerSchema"

describe("registerSchema", () => {
  it("should accept a valid payload and normalize the e-mail", () => {
    const result = registerSchema.parse({
      email: "  Marina@Example.com ",
      password: "Senha123",
      tenantName: "Minha Empresa",
    })

    expect(result.email).toBe("marina@example.com")
  })

  it("should reject a password shorter than 8 characters", () => {
    expect(() =>
      registerSchema.parse({ email: "a@b.com", password: "Ab1", tenantName: "X" }),
    ).toThrow()
  })

  it("should reject a password without a number", () => {
    expect(() =>
      registerSchema.parse({ email: "a@b.com", password: "Password", tenantName: "X" }),
    ).toThrow()
  })

  it("should reject a password without an uppercase letter", () => {
    expect(() =>
      registerSchema.parse({ email: "a@b.com", password: "password1", tenantName: "X" }),
    ).toThrow()
  })

  it("should reject an empty tenant name", () => {
    expect(() =>
      registerSchema.parse({ email: "a@b.com", password: "Senha123", tenantName: "  " }),
    ).toThrow()
  })

  it("should reject an invalid e-mail", () => {
    expect(() =>
      registerSchema.parse({ email: "not-an-email", password: "Senha123", tenantName: "X" }),
    ).toThrow()
  })
})
