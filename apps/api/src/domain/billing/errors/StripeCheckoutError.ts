export class StripeCheckoutError extends Error {
  constructor(reason: string) {
    super(`Stripe checkout failed: ${reason}`)
    this.name = "StripeCheckoutError"
  }
}
