import { OAuthRefreshFailedError } from "../domain/errors/OAuthRefreshFailedError"
import { TiktokTokenRefresher } from "./TiktokTokenRefresher"

describe("TiktokTokenRefresher", () => {
  it("should refresh the access token", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "new-access",
          refresh_token: "rotated",
          expires_in: 3_600,
        }),
    })
    const refresher = new TiktokTokenRefresher({ clientKey: "key", clientSecret: "secret" })

    const result = await refresher.refreshAccessToken("old-refresh")

    expect(result.accessToken).toBe("new-access")
    expect(result.refreshToken).toBe("rotated")
    expect(result.accessTokenExpiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it("should throw OAuthRefreshFailedError when the token endpoint rejects the request", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 })
    const refresher = new TiktokTokenRefresher({ clientKey: "key", clientSecret: "secret" })

    await expect(refresher.refreshAccessToken("revoked")).rejects.toThrow(OAuthRefreshFailedError)
  })
})
