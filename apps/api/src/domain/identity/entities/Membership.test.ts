import { Membership } from "./Membership"

describe("Membership", () => {
  it("should create a membership with the given role", () => {
    const membership = Membership.create({
      id: "m1",
      tenantId: "t1",
      userId: "u1",
      role: "ADMIN",
    })

    expect(membership.id).toBe("m1")
    expect(membership.role).toBe("ADMIN")
    expect(membership.tenantId).toBe("t1")
    expect(membership.userId).toBe("u1")
    expect(membership.createdAt).toBeInstanceOf(Date)
  })

  it("should report isOwner() true only for the OWNER role", () => {
    const owner = Membership.create({ id: "m1", tenantId: "t1", userId: "u1", role: "OWNER" })
    const member = Membership.create({ id: "m2", tenantId: "t1", userId: "u2", role: "MEMBER" })

    expect(owner.isOwner()).toBe(true)
    expect(member.isOwner()).toBe(false)
  })
})
