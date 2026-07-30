import { OAuthRefreshFailedError } from "../domain/errors/OAuthRefreshFailedError"
import { YoutubeTokenRefresher } from "./YoutubeTokenRefresher"

describe("YoutubeTokenRefresher", () => {
  it("should refresh the access token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "new-access", expires_in: 3_600 }),
    })
    const refresher = new YoutubeTokenRefresher({ clientId: "id", clientSecret: "secret" })

    const result = await refresher.refreshAccessToken("old-refresh")

    expect(result.accessToken).toBe("new-access")
    expect(result.refreshToken).toBe("old-refresh")
    expect(result.accessTokenExpiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it("should use the rotated refresh token when Google returns one", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new-access",
          refresh_token: "rotated",
          expires_in: 3_600,
        }),
    })
    const refresher = new YoutubeTokenRefresher({ clientId: "id", clientSecret: "secret" })

    const result = await refresher.refreshAccessToken("old-refresh")

    expect(result.refreshToken).toBe("rotated")
  })

  it("should throw OAuthRefreshFailedError when the token endpoint rejects the request", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 })
    const refresher = new YoutubeTokenRefresher({ clientId: "id", clientSecret: "secret" })

    await expect(refresher.refreshAccessToken("revoked")).rejects.toThrow(OAuthRefreshFailedError)
  })
})
