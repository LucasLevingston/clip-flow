import type {
  CheckoutSessionProvider,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionOutput,
} from "../../domain/billing/services/CheckoutSessionProvider"

export class FakeCheckoutSessionProvider implements CheckoutSessionProvider {
  readonly calls: CreateCheckoutSessionInput[] = []

  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
    this.calls.push(input)
    return Promise.resolve({
      checkoutUrl: `https://checkout.stripe.local/test/${input.tenantId}/${input.stripePriceId}`,
    })
  }
}
