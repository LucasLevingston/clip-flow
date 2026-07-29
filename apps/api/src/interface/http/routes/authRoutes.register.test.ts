import { buildTestServer } from "../../../test-utils/buildTestServer"

describe("POST /v1/auth/register", () => {
  it("should register a tenant and return a session with a refresh token cookie", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "marina@example.com", password: "Senha123", tenantName: "Minha Empresa" },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().user.email).toBe("marina@example.com")
    expect(response.json().accessToken).toBeDefined()
    expect(response.headers["set-cookie"]).toBeDefined()

    await app.close()
  })

  it("should reject registration with an invalid payload", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "not-an-email", password: "short", tenantName: "" },
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("VALIDATION_ERROR")

    await app.close()
  })

  it("should reject registration with a duplicate e-mail", async () => {
    const { app } = buildTestServer()
    const payload = { email: "marina@example.com", password: "Senha123", tenantName: "X" }
    await app.inject({ method: "POST", url: "/v1/auth/register", payload })

    const response = await app.inject({ method: "POST", url: "/v1/auth/register", payload })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe("EMAIL_ALREADY_EXISTS")

    await app.close()
  })
})
