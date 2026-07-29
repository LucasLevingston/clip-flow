import type { SubscriptionRepository } from "../../../domain/billing/repositories/SubscriptionRepository"
import type {
  BillingWebhookEvent,
  StripeWebhookVerifier,
} from "../../../domain/billing/services/StripeWebhookVerifier"

export interface ProcessStripeWebhookInput {
  payload: string | Buffer
  signature: string | undefined
}

export interface ProcessStripeWebhookUseCaseDeps {
  webhookVerifier: StripeWebhookVerifier
  subscriptionRepository: SubscriptionRepository
}

/** RF-08 — syncs Subscription.status with Stripe events. Unknown event types are ignored, not errors. */
export class ProcessStripeWebhookUseCase {
  constructor(private readonly deps: ProcessStripeWebhookUseCaseDeps) {}

  async execute(input: ProcessStripeWebhookInput): Promise<void> {
    const event = this.deps.webhookVerifier.verifyAndParse(input.payload, input.signature)

    if (event.type === "checkout.session.completed") {
      await this.handleCheckoutCompleted(event)
      return
    }

    if (event.type === "unhandled" || !event.stripeCustomerId) {
      return
    }

    const subscription = await this.deps.subscriptionRepository.findByStripeCustomerId(
      event.stripeCustomerId,
    )
    if (!subscription) return

    if (event.type === "invoice.paid") {
      await this.deps.subscriptionRepository.save(subscription.withStatus("ACTIVE"))
    } else if (event.type === "invoice.payment_failed") {
      await this.deps.subscriptionRepository.save(subscription.withStatus("PAST_DUE"))
    } else if (event.type === "customer.subscription.deleted") {
      await this.deps.subscriptionRepository.save(subscription.withStatus("CANCELED"))
    }
  }

  private async handleCheckoutCompleted(event: BillingWebhookEvent): Promise<void> {
    if (!event.tenantId || !event.stripeCustomerId || !event.stripeSubscriptionId) return

    const subscription = await this.deps.subscriptionRepository.findByTenantId(event.tenantId)
    if (!subscription) return

    await this.deps.subscriptionRepository.save(
      subscription.withStripeIds(event.stripeCustomerId, event.stripeSubscriptionId),
    )
  }
}
