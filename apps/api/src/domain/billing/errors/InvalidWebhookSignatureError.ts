export class InvalidWebhookSignatureError extends Error {
  constructor() {
    super("Invalid Stripe webhook signature")
    this.name = "InvalidWebhookSignatureError"
  }
}
