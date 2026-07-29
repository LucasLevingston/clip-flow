import { TenantFactory } from "./TenantFactory"

describe("TenantFactory", () => {
  it("should create a tenant with exactly one OWNER membership", () => {
    const { tenant, ownerMembership } = TenantFactory.create({
      tenantId: "t1",
      membershipId: "m1",
      name: "Minha Empresa",
      timezone: "America/Sao_Paulo",
      ownerUserId: "u1",
    })

    expect(tenant.id).toBe("t1")
    expect(ownerMembership.tenantId).toBe(tenant.id)
    expect(ownerMembership.userId).toBe("u1")
    expect(ownerMembership.isOwner()).toBe(true)
  })

  it("should propagate tenant validation errors", () => {
    expect(() =>
      TenantFactory.create({
        tenantId: "t1",
        membershipId: "m1",
        name: "   ",
        timezone: "UTC",
        ownerUserId: "u1",
      }),
    ).toThrow("Tenant name must not be empty")
  })
})
