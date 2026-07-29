import { InvalidWebhookSignatureError } from "./InvalidWebhookSignatureError"

describe("InvalidWebhookSignatureError", () => {
  it("should carry a descriptive message and name", () => {
    const error = new InvalidWebhookSignatureError()

    expect(error.message).toBe("Invalid Stripe webhook signature")
    expect(error.name).toBe("InvalidWebhookSignatureError")
  })
})
