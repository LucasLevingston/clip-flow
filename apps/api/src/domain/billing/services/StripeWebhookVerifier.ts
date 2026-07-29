export type BillingWebhookEventType =
  | "checkout.session.completed"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "customer.subscription.deleted"
  | "unhandled"

export interface BillingWebhookEvent {
  type: BillingWebhookEventType
  tenantId: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export interface StripeWebhookVerifier {
  /** Throws InvalidWebhookSignatureError when the signature does not check out. */
  verifyAndParse(payload: string | Buffer, signature: string | undefined): BillingWebhookEvent
}
