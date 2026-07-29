import { oauthCallbackSchema } from "./oauthCallbackSchema"

describe("oauthCallbackSchema", () => {
  it("should accept a valid payload", () => {
    expect(oauthCallbackSchema.parse({ code: "abc", state: "xyz" })).toEqual({
      code: "abc",
      state: "xyz",
    })
  })

  it("should reject an empty code", () => {
    expect(() => oauthCallbackSchema.parse({ code: "", state: "xyz" })).toThrow()
  })

  it("should reject an empty state", () => {
    expect(() => oauthCallbackSchema.parse({ code: "abc", state: "" })).toThrow()
  })
})
