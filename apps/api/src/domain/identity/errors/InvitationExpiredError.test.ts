import { InvitationExpiredError } from "./InvitationExpiredError"

describe("InvitationExpiredError", () => {
  it("should carry a descriptive message and name", () => {
    const error = new InvitationExpiredError()

    expect(error.message).toBe("Invitation has expired")
    expect(error.name).toBe("InvitationExpiredError")
  })
})
