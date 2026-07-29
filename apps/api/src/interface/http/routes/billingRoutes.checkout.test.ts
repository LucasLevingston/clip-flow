import { buildTestServer } from "../../../test-utils/buildTestServer"

async function registerOwner(app: ReturnType<typeof buildTestServer>["app"]) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
  })
  return response.json().accessToken as string
}

describe("POST /v1/billing/checkout-session", () => {
  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/checkout-session",
      payload: { planId: "pro-plan" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid payload", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/checkout-session",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {},
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should create a checkout session for a purchasable plan", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/checkout-session",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { planId: "pro-plan" },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().checkoutUrl).toContain("price_pro_test")

    await app.close()
  })

  it("should 404 when the plan does not exist", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/checkout-session",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { planId: "ghost-plan" },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("PLAN_NOT_FOUND")

    await app.close()
  })

  it("should 404 when the plan has no Stripe price (not purchasable)", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/billing/checkout-session",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { planId: "trial-plan" },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("PLAN_NOT_FOUND")

    await app.close()
  })
})
