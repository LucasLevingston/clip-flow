import { MembershipAlreadyExistsError } from "./MembershipAlreadyExistsError"

describe("MembershipAlreadyExistsError", () => {
  it("should carry a descriptive message and name", () => {
    const error = new MembershipAlreadyExistsError("marina@example.com")

    expect(error.message).toBe('"marina@example.com" is already a member of this tenant')
    expect(error.name).toBe("MembershipAlreadyExistsError")
  })
})
