import { buildTestServer } from "../../../test-utils/buildTestServer"

async function registerOwner(app: ReturnType<typeof buildTestServer>["app"]) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
  })
  const body = response.json<{ accessToken: string; tenant: { id: string } }>()
  return { accessToken: body.accessToken, tenantId: body.tenant.id }
}

describe("POST /v1/subscription/change-plan", () => {
  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/subscription/change-plan",
      payload: { planId: "pro-plan" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid payload", async () => {
    const { app } = buildTestServer()
    const { accessToken } = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/subscription/change-plan",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {},
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should upgrade to a plan with more capacity", async () => {
    const { app } = buildTestServer()
    const { accessToken } = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/subscription/change-plan",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { planId: "pro-plan" },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().plan).toEqual({ id: "pro-plan", name: "PRO" })

    await app.close()
  })

  it("should 404 when the target plan does not exist", async () => {
    const { app } = buildTestServer()
    const { accessToken } = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/subscription/change-plan",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { planId: "ghost-plan" },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("PLAN_NOT_FOUND")

    await app.close()
  })

  it("should block a downgrade that exceeds the new plan's channel limit", async () => {
    const { app, channelUsageProvider } = buildTestServer()
    const { accessToken, tenantId } = await registerOwner(app)
    await app.inject({
      method: "POST",
      url: "/v1/subscription/change-plan",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { planId: "pro-plan" },
    })
    channelUsageProvider.setCount(tenantId, 2)

    const response = await app.inject({
      method: "POST",
      url: "/v1/subscription/change-plan",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { planId: "starter-plan" },
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("DOWNGRADE_BLOCKED_BY_USAGE")
    expect(response.json().error.details.exceeding).toEqual(["channels"])

    await app.close()
  })
})
