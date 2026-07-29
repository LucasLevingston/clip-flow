import { buildTestServer } from "../../../test-utils/buildTestServer"

describe("GET /v1/auth/me", () => {
  it("should return the current user for a valid access token", async () => {
    const { app } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "marina@example.com", password: "Senha123", tenantName: "Minha Empresa" },
    })
    const accessToken = registerResponse.json().accessToken as string

    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().tenant.name).toBe("Minha Empresa")
    expect(response.json().role).toBe("OWNER")

    await app.close()
  })

  it("should reject /me without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/auth/me" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject /me with a malformed authorization header", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: "not-bearer" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject /me with an unparseable bearer token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: "Bearer garbage" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject /me when the token's tenant no longer has a membership for the user", async () => {
    const { app, ctx } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "marina@example.com", password: "Senha123", tenantName: "X" },
    })
    const decoded = ctx.jwtService.verifyAccessToken(registerResponse.json().accessToken as string)
    const tokenForUnknownTenant = ctx.jwtService.signAccessToken({
      ...decoded,
      tenantId: "tenant-that-does-not-exist",
    })

    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${tokenForUnknownTenant}` },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})
