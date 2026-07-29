import Stripe from "stripe"
import { InvalidWebhookSignatureError } from "../../domain/billing/errors/InvalidWebhookSignatureError"
import type {
  BillingWebhookEvent,
  BillingWebhookEventType,
  StripeWebhookVerifier,
} from "../../domain/billing/services/StripeWebhookVerifier"

const HANDLED_TYPES: BillingWebhookEventType[] = [
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.deleted",
]

function customerId(
  value: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  return typeof value === "string" ? value : null
}

function toBillingEvent(event: Stripe.Event): BillingWebhookEvent {
  if (!HANDLED_TYPES.includes(event.type as BillingWebhookEventType)) {
    return { type: "unhandled", tenantId: null, stripeCustomerId: null, stripeSubscriptionId: null }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    return {
      type: "checkout.session.completed",
      tenantId: session.client_reference_id,
      stripeCustomerId: customerId(session.customer),
      stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
    }
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoice = event.data.object
    return {
      type: event.type,
      tenantId: null,
      stripeCustomerId: customerId(invoice.customer ?? null),
      stripeSubscriptionId: null,
    }
  }

  const subscription = event.data.object as Stripe.Subscription
  return {
    type: "customer.subscription.deleted",
    tenantId: null,
    stripeCustomerId: customerId(subscription.customer),
    stripeSubscriptionId: null,
  }
}

/** `stripe.webhooks.constructEvent` is a local cryptographic check — no API key/network call needed. */
export class StripeWebhookVerifierAdapter implements StripeWebhookVerifier {
  private readonly stripe = new Stripe("")

  constructor(private readonly webhookSecret: string) {}

  verifyAndParse(payload: string | Buffer, signature: string | undefined): BillingWebhookEvent {
    if (!signature) {
      throw new InvalidWebhookSignatureError()
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret)
      return toBillingEvent(event)
    } catch {
      throw new InvalidWebhookSignatureError()
    }
  }
}
