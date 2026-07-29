import { getErrorMessage } from "./getErrorMessage"

describe("getErrorMessage", () => {
  it("should return the message when given an Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom")
  })

  it("should return a fallback when given a non-Error value", () => {
    expect(getErrorMessage("boom")).toBe("Unexpected error")
  })
})
