import { InvalidTimezoneError } from "../errors/InvalidTimezoneError"
import { Tenant } from "./Tenant"

describe("Tenant", () => {
  it("should create a tenant with valid name and timezone", () => {
    const tenant = Tenant.create({
      id: "t1",
      name: "  Minha Empresa  ",
      timezone: "America/Sao_Paulo",
    })

    expect(tenant.name).toBe("Minha Empresa")
    expect(tenant.timezone).toBe("America/Sao_Paulo")
    expect(tenant.id).toBe("t1")
    expect(tenant.createdAt).toBeInstanceOf(Date)
  })

  it("should reject an empty name", () => {
    expect(() => Tenant.create({ id: "t1", name: "   ", timezone: "UTC" })).toThrow(
      "Tenant name must not be empty",
    )
  })

  it("should reject an invalid IANA timezone", () => {
    expect(() => Tenant.create({ id: "t1", name: "X", timezone: "Not/AZone" })).toThrow(
      InvalidTimezoneError,
    )
  })

  it("should accept a caller-provided createdAt", () => {
    const createdAt = new Date("2026-01-01T00:00:00Z")

    const tenant = Tenant.create({ id: "t1", name: "X", timezone: "UTC", createdAt })

    expect(tenant.createdAt).toBe(createdAt)
  })
})
