import { InvalidEmailError } from "../errors/InvalidEmailError"
import { Email } from "./Email"

describe("Email", () => {
  it("should normalize (trim + lowercase) a valid email", () => {
    const email = Email.create("  Marina@Example.com ")

    expect(email.value).toBe("marina@example.com")
  })

  it("should throw InvalidEmailError for a malformed value", () => {
    expect(() => Email.create("not-an-email")).toThrow(InvalidEmailError)
  })

  it("should consider two emails with the same normalized value equal", () => {
    const a = Email.create("a@b.com")
    const b = Email.create("A@B.com")

    expect(a.equals(b)).toBe(true)
  })

  it("should consider two different emails not equal", () => {
    const a = Email.create("a@b.com")
    const b = Email.create("c@d.com")

    expect(a.equals(b)).toBe(false)
  })
})
