import { buildTestServer } from "../../../test-utils/buildTestServer"

describe("POST /v1/billing/webhooks/stripe", () => {
  it("should reject a request with no signature header", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/webhooks/stripe",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ type: "invoice.paid" }),
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe("INVALID_SIGNATURE")

    await app.close()
  })

  it("should reject a request with an invalid signature", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/webhooks/stripe",
      headers: { "content-type": "application/json", "stripe-signature": "not-valid" },
      payload: JSON.stringify({ type: "invoice.paid" }),
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe("INVALID_SIGNATURE")

    await app.close()
  })

  it("should accept and process a validly signed event", async () => {
    const { app, ctx } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
    })
    const { tenant } = registerResponse.json<{ tenant: { id: string } }>()
    const subscription = await ctx.subscriptionRepository.findByTenantId(tenant.id)
    if (!subscription) throw new Error("expected a subscription to exist after registration")
    await ctx.subscriptionRepository.save(subscription.withStripeIds("cus_1", "sub_stripe_1"))

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/webhooks/stripe",
      headers: { "content-type": "application/json", "stripe-signature": "valid-signature" },
      payload: JSON.stringify({ type: "invoice.paid", stripeCustomerId: "cus_1" }),
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ received: true })
    const updated = await ctx.subscriptionRepository.findByTenantId(tenant.id)
    expect(updated?.status).toBe("ACTIVE")

    await app.close()
  })

  it("should return 200 for an unhandled event type", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/webhooks/stripe",
      headers: { "content-type": "application/json", "stripe-signature": "valid-signature" },
      payload: JSON.stringify({ type: "unhandled" }),
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ received: true })

    await app.close()
  })
})
