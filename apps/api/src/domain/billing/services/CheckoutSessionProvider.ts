export interface CreateCheckoutSessionInput {
  tenantId: string
  customerEmail: string
  stripePriceId: string
}

export interface CreateCheckoutSessionOutput {
  checkoutUrl: string
}

export interface CheckoutSessionProvider {
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput>
}
