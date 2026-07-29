import Stripe from "stripe"
import { StripeCheckoutError } from "../../domain/billing/errors/StripeCheckoutError"
import type {
  CheckoutSessionProvider,
  CreateCheckoutSessionInput,
  CreateCheckoutSessionOutput,
} from "../../domain/billing/services/CheckoutSessionProvider"

export interface StripeCheckoutSessionAdapterConfig {
  secretKey: string
  successUrl: string
  cancelUrl: string
}

export class StripeCheckoutSessionAdapter implements CheckoutSessionProvider {
  private readonly stripe: Stripe

  constructor(private readonly config: StripeCheckoutSessionAdapterConfig) {
    this.stripe = new Stripe(config.secretKey)
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CreateCheckoutSessionOutput> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "subscription",
        client_reference_id: input.tenantId,
        customer_email: input.customerEmail,
        line_items: [{ price: input.stripePriceId, quantity: 1 }],
        success_url: this.config.successUrl,
        cancel_url: this.config.cancelUrl,
      })

      if (!session.url) {
        throw new StripeCheckoutError("Stripe did not return a checkout URL")
      }

      return { checkoutUrl: session.url }
    } catch (error) {
      if (error instanceof StripeCheckoutError) throw error
      throw new StripeCheckoutError(error instanceof Error ? error.message : "unknown error")
    }
  }
}
