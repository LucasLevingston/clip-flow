import { buildTestServer } from "../../../test-utils/buildTestServer"

async function registerAndGetToken(
  app: ReturnType<typeof buildTestServer>["app"],
  email: string,
  tenantName: string,
) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email, password: "Senha123", tenantName },
  })
  const body = response.json<{ accessToken: string; tenant: { id: string } }>()
  return { accessToken: body.accessToken, tenantId: body.tenant.id }
}

describe("POST /v1/members/invitations/accept", () => {
  it("should create a membership for a pending invitation matching the caller's e-mail", async () => {
    const { app } = buildTestServer()
    const owner = await registerAndGetToken(app, "owner@example.com", "Studio")
    const invitee = await registerAndGetToken(app, "invitee@example.com", "Invitee Co")
    await app.inject({
      method: "POST",
      url: "/v1/members/invite",
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { email: "invitee@example.com", role: "ADMIN" },
    })

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invitations/accept",
      headers: { authorization: `Bearer ${invitee.accessToken}` },
      payload: { tenantId: owner.tenantId },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ tenantId: owner.tenantId, role: "ADMIN" })

    await app.close()
  })

  it("should reject accepting without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invitations/accept",
      payload: { tenantId: "tenant-1" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject accepting with an invalid payload", async () => {
    const { app } = buildTestServer()
    const invitee = await registerAndGetToken(app, "invitee@example.com", "Invitee Co")

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invitations/accept",
      headers: { authorization: `Bearer ${invitee.accessToken}` },
      payload: {},
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should reject accepting when there is no pending invitation", async () => {
    const { app } = buildTestServer()
    const invitee = await registerAndGetToken(app, "invitee@example.com", "Invitee Co")

    const response = await app.inject({
      method: "POST",
      url: "/v1/members/invitations/accept",
      headers: { authorization: `Bearer ${invitee.accessToken}` },
      payload: { tenantId: "tenant-with-no-invite" },
    })

    expect(response.statusCode).toBe(410)
    expect(response.json().error.code).toBe("INVITATION_EXPIRED")

    await app.close()
  })
})
