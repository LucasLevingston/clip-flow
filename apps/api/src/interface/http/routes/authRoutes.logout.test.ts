import { buildTestServer } from "../../../test-utils/buildTestServer"
import { extractCookie } from "./authRoutes.testHelpers"

describe("POST /v1/auth/logout", () => {
  it("should log out and clear the refresh cookie", async () => {
    const { app } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "marina@example.com", password: "Senha123", tenantName: "X" },
    })
    const rawCookie = extractCookie(registerResponse.headers["set-cookie"])

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/logout",
      cookies: { refresh_token: rawCookie },
    })

    expect(response.statusCode).toBe(204)

    const refreshAfterLogout = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      cookies: { refresh_token: rawCookie },
    })
    expect(refreshAfterLogout.statusCode).toBe(401)

    await app.close()
  })

  it("should log out successfully even without a refresh cookie", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "POST", url: "/v1/auth/logout" })

    expect(response.statusCode).toBe(204)

    await app.close()
  })
})
