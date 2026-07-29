import { Subscription } from "../../../domain/billing/entities/Subscription"
import { InvalidWebhookSignatureError } from "../../../domain/billing/errors/InvalidWebhookSignatureError"
import { FakeStripeWebhookVerifier } from "../../../test-utils/fakes/FakeStripeWebhookVerifier"
import { InMemorySubscriptionRepository } from "../../../test-utils/fakes/InMemorySubscriptionRepository"
import { ProcessStripeWebhookUseCase } from "./ProcessStripeWebhookUseCase"

const VALID_SIGNATURE = "valid-signature"

function buildUseCase() {
  const subscriptionRepository = new InMemorySubscriptionRepository()
  const webhookVerifier = new FakeStripeWebhookVerifier()
  const useCase = new ProcessStripeWebhookUseCase({ webhookVerifier, subscriptionRepository })
  return { useCase, subscriptionRepository }
}

function seedSubscription(
  repo: InMemorySubscriptionRepository,
  overrides: Partial<Parameters<typeof Subscription.create>[0]>,
) {
  return repo.save(
    Subscription.create({
      id: overrides.id ?? "sub-1",
      tenantId: overrides.tenantId ?? "tenant-1",
      planId: overrides.planId ?? "plan-pro",
      status: overrides.status ?? "TRIAL",
      currentPeriodEnd: overrides.currentPeriodEnd ?? null,
      stripeCustomerId: overrides.stripeCustomerId ?? null,
      stripeSubscriptionId: overrides.stripeSubscriptionId ?? null,
      createdAt: overrides.createdAt ?? new Date(),
    }),
  )
}

describe("ProcessStripeWebhookUseCase", () => {
  it("should reject an invalid signature", async () => {
    const { useCase } = buildUseCase()

    await expect(useCase.execute({ payload: "{}", signature: "bad-signature" })).rejects.toThrow(
      InvalidWebhookSignatureError,
    )
  })

  it("should attach Stripe ids on checkout.session.completed", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await seedSubscription(subscriptionRepository, { tenantId: "tenant-1" })

    await useCase.execute({
      payload: JSON.stringify({
        type: "checkout.session.completed",
        tenantId: "tenant-1",
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_stripe_1",
      }),
      signature: VALID_SIGNATURE,
    })

    const updated = await subscriptionRepository.findByTenantId("tenant-1")
    expect(updated?.stripeCustomerId).toBe("cus_1")
    expect(updated?.stripeSubscriptionId).toBe("sub_stripe_1")
  })

  it("should ignore checkout.session.completed for an unknown tenant", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()

    await useCase.execute({
      payload: JSON.stringify({
        type: "checkout.session.completed",
        tenantId: "ghost-tenant",
        stripeCustomerId: "cus_1",
        stripeSubscriptionId: "sub_stripe_1",
      }),
      signature: VALID_SIGNATURE,
    })

    expect(await subscriptionRepository.findByTenantId("ghost-tenant")).toBeNull()
  })

  it("should activate the subscription on invoice.paid", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await seedSubscription(subscriptionRepository, {
      tenantId: "tenant-1",
      status: "PAST_DUE",
      stripeCustomerId: "cus_1",
    })

    await useCase.execute({
      payload: JSON.stringify({ type: "invoice.paid", stripeCustomerId: "cus_1" }),
      signature: VALID_SIGNATURE,
    })

    const updated = await subscriptionRepository.findByTenantId("tenant-1")
    expect(updated?.status).toBe("ACTIVE")
  })

  it("should mark the subscription PAST_DUE on invoice.payment_failed", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await seedSubscription(subscriptionRepository, {
      tenantId: "tenant-1",
      status: "ACTIVE",
      stripeCustomerId: "cus_1",
    })

    await useCase.execute({
      payload: JSON.stringify({ type: "invoice.payment_failed", stripeCustomerId: "cus_1" }),
      signature: VALID_SIGNATURE,
    })

    const updated = await subscriptionRepository.findByTenantId("tenant-1")
    expect(updated?.status).toBe("PAST_DUE")
  })

  it("should cancel the subscription on customer.subscription.deleted", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await seedSubscription(subscriptionRepository, {
      tenantId: "tenant-1",
      status: "ACTIVE",
      stripeCustomerId: "cus_1",
    })

    await useCase.execute({
      payload: JSON.stringify({ type: "customer.subscription.deleted", stripeCustomerId: "cus_1" }),
      signature: VALID_SIGNATURE,
    })

    const updated = await subscriptionRepository.findByTenantId("tenant-1")
    expect(updated?.status).toBe("CANCELED")
  })

  it("should ignore events for an unknown Stripe customer", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()

    await useCase.execute({
      payload: JSON.stringify({ type: "invoice.paid", stripeCustomerId: "ghost-customer" }),
      signature: VALID_SIGNATURE,
    })

    expect(await subscriptionRepository.findByStripeCustomerId("ghost-customer")).toBeNull()
  })

  it("should ignore checkout.session.completed missing required fields", async () => {
    const { useCase, subscriptionRepository } = buildUseCase()
    await seedSubscription(subscriptionRepository, { tenantId: "tenant-1" })

    await useCase.execute({
      payload: JSON.stringify({ type: "checkout.session.completed", tenantId: "tenant-1" }),
      signature: VALID_SIGNATURE,
    })

    const unchanged = await subscriptionRepository.findByTenantId("tenant-1")
    expect(unchanged?.stripeCustomerId).toBeNull()
  })

  it("should ignore events with no Stripe customer id at all", async () => {
    const { useCase } = buildUseCase()

    await expect(
      useCase.execute({
        payload: JSON.stringify({ type: "invoice.paid" }),
        signature: VALID_SIGNATURE,
      }),
    ).resolves.toBeUndefined()
  })

  it("should ignore unhandled event types without throwing", async () => {
    const { useCase } = buildUseCase()

    await expect(
      useCase.execute({
        payload: JSON.stringify({ type: "unhandled" }),
        signature: VALID_SIGNATURE,
      }),
    ).resolves.toBeUndefined()
  })
})
