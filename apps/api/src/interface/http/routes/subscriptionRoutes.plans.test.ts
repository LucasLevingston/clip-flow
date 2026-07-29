import { buildTestServer } from "../../../test-utils/buildTestServer"

describe("GET /v1/plans", () => {
  it("should list plans publicly, without auth", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/plans" })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(4)
    expect(response.json().map((plan: { name: string }) => plan.name)).toContain("TRIAL")

    await app.close()
  })
})

describe("GET /v1/subscription", () => {
  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/subscription" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should return the tenant's TRIAL subscription and channel usage", async () => {
    const { app } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
    })
    const accessToken = registerResponse.json().accessToken as string

    const response = await app.inject({
      method: "GET",
      url: "/v1/subscription",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      plan: { id: "trial-plan", name: "TRIAL" },
      status: "TRIAL",
      currentPeriodEnd: null,
      usage: { channels: { current: 0, max: 1 } },
    })

    await app.close()
  })
})
