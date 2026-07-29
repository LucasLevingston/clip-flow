import { StripeCheckoutError } from "./StripeCheckoutError"

describe("StripeCheckoutError", () => {
  it("should carry a descriptive message and name", () => {
    const error = new StripeCheckoutError("network timeout")

    expect(error.message).toBe("Stripe checkout failed: network timeout")
    expect(error.name).toBe("StripeCheckoutError")
  })
})
