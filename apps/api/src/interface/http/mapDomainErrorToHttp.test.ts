import { DowngradeBlockedByUsageError } from "../../domain/billing/errors/DowngradeBlockedByUsageError"
import { StripeCheckoutError } from "../../domain/billing/errors/StripeCheckoutError"
import { EmailAlreadyExistsError } from "../../domain/identity/errors/EmailAlreadyExistsError"
import { mapDomainErrorToHttp } from "./mapDomainErrorToHttp"

describe("mapDomainErrorToHttp", () => {
  it("should map a known domain error to its HTTP status and code", () => {
    expect(mapDomainErrorToHttp(new EmailAlreadyExistsError("a@b.com"))).toEqual({
      statusCode: 409,
      code: "EMAIL_ALREADY_EXISTS",
    })
  })

  it("should map DowngradeBlockedByUsageError to 422", () => {
    expect(mapDomainErrorToHttp(new DowngradeBlockedByUsageError(["channels"]))).toEqual({
      statusCode: 422,
      code: "DOWNGRADE_BLOCKED_BY_USAGE",
    })
  })

  it("should map StripeCheckoutError to 502", () => {
    expect(mapDomainErrorToHttp(new StripeCheckoutError("timeout"))).toEqual({
      statusCode: 502,
      code: "STRIPE_ERROR",
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
