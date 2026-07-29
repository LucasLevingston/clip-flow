import { User } from "./User"

describe("User", () => {
  it("should create a user with a normalized email and default flags", () => {
    const user = User.create({ id: "u1", email: "A@B.com", passwordHash: "hash" })

    expect(user.id).toBe("u1")
    expect(user.email.value).toBe("a@b.com")
    expect(user.isPlatformAdmin).toBe(false)
    expect(user.passwordHash).toBe("hash")
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it("should honor an explicit isPlatformAdmin flag", () => {
    const user = User.create({
      id: "u1",
      email: "a@b.com",
      passwordHash: "hash",
      isPlatformAdmin: true,
    })

    expect(user.isPlatformAdmin).toBe(true)
  })
})
