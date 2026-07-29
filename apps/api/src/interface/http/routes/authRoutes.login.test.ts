import { buildTestServer } from "../../../test-utils/buildTestServer"

describe("POST /v1/auth/login", () => {
  it("should log in with valid credentials", async () => {
    const { app } = buildTestServer()
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "marina@example.com", password: "Senha123", tenantName: "X" },
    })

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "marina@example.com", password: "Senha123" },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().accessToken).toBeDefined()

    await app.close()
  })

  it("should reject login with an invalid payload", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "not-an-email", password: "" },
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("VALIDATION_ERROR")

    await app.close()
  })

  it("should reject login with wrong credentials", async () => {
    const { app } = buildTestServer()
    await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "marina@example.com", password: "Senha123", tenantName: "X" },
    })

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "ghost@example.com", password: "Senha123" },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().error.code).toBe("INVALID_CREDENTIALS")

    await app.close()
  })
})
