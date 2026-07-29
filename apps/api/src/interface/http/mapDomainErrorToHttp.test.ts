import { EmailAlreadyExistsError } from "../../domain/identity/errors/EmailAlreadyExistsError"
import { mapDomainErrorToHttp } from "./mapDomainErrorToHttp"

describe("mapDomainErrorToHttp", () => {
  it("should map a known domain error to its HTTP status and code", () => {
    expect(mapDomainErrorToHttp(new EmailAlreadyExistsError("a@b.com"))).toEqual({
      statusCode: 409,
      code: "EMAIL_ALREADY_EXISTS",
    })
  })

  it("should fall back to a generic 500 for an unmapped Error", () => {
    expect(mapDomainErrorToHttp(new Error("boom"))).toEqual({
      statusCode: 500,
      code: "INTERNAL_ERROR",
    })
  })

  it("should fall back to a generic 500 for a non-Error value", () => {
    expect(mapDomainErrorToHttp("boom")).toEqual({ statusCode: 500, code: "INTERNAL_ERROR" })
  })
})
