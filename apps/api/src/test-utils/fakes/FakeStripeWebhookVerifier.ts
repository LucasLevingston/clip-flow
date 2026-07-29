import { InvalidWebhookSignatureError } from "../../domain/billing/errors/InvalidWebhookSignatureError"
import type {
  BillingWebhookEvent,
  StripeWebhookVerifier,
} from "../../domain/billing/services/StripeWebhookVerifier"

const VALID_SIGNATURE = "valid-signature"

/** Test double — real signature verification is Stripe SDK crypto, out of scope for CI (per ISSUE-03.F2.S1.T2). */
export class FakeStripeWebhookVerifier implements StripeWebhookVerifier {
  verifyAndParse(payload: string | Buffer, signature: string | undefined): BillingWebhookEvent {
    if (signature !== VALID_SIGNATURE) {
      throw new InvalidWebhookSignatureError()
    }
    return JSON.parse(payload.toString()) as BillingWebhookEvent
  }
}
