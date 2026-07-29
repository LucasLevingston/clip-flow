import { buildTestServer } from "../../../test-utils/buildTestServer"
import { extractCookie } from "./authRoutes.testHelpers"

describe("POST /v1/auth/refresh", () => {
  it("should refresh the access token using the refresh cookie", async () => {
    const { app } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "marina@example.com", password: "Senha123", tenantName: "X" },
    })
    const rawCookie = extractCookie(registerResponse.headers["set-cookie"])

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      cookies: { refresh_token: rawCookie },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().accessToken).toBeDefined()

    await app.close()
  })

  it("should reject refresh without a cookie", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "POST", url: "/v1/auth/refresh" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject refresh with a cookie that matches no stored token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      cookies: { refresh_token: "garbage-token" },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().error.code).toBe("INVALID_REFRESH_TOKEN")

    await app.close()
  })
})
