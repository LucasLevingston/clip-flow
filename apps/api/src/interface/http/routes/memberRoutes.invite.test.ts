import { buildTestServer } from "../../../test-utils/buildTestServer"

async function registerOwner(app: ReturnType<typeof buildTestServer>["app"]) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
  })
  return response.json().accessToken as string
}

describe("POST /v1/members/invite", () => {
  it("should let an OWNER invite a new member", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invite",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { email: "nova@example.com", role: "MEMBER" },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().email).toBe("nova@example.com")
    expect(response.json().role).toBe("MEMBER")

    await app.close()
  })

  it("should reject an invite without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invite",
      payload: { email: "nova@example.com", role: "MEMBER" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invite with an invalid payload", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invite",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { email: "not-an-email", role: "OWNER" },
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should reject inviting someone who is already a member", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invite",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { email: "owner@example.com", role: "ADMIN" },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe("MEMBERSHIP_ALREADY_EXISTS")

    await app.close()
  })
})
