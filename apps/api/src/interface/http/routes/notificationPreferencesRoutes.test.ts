import { NOTIFICATION_CATEGORIES } from "../../../domain/notifications/types"
import { buildTestServer } from "../../../test-utils/buildTestServer"

function mintToken(ctx: ReturnType<typeof buildTestServer>["ctx"]) {
  return ctx.jwtService.signAccessToken({
    sub: "user-1",
    tenantId: "tenant-1",
    role: "OWNER",
    isPlatformAdmin: false,
  })
}

describe("GET /v1/notification-preferences", () => {
  it("should return every category defaulted to enabled when unconfigured", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/notification-preferences",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(NOTIFICATION_CATEGORIES.length)
    expect(response.json()).toEqual(
      expect.arrayContaining(
        NOTIFICATION_CATEGORIES.map((category) => ({ category, emailEnabled: true })),
      ),
    )

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/notification-preferences" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})

describe("PUT /v1/notification-preferences", () => {
  it("should persist and return the updated preferences", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "PUT",
      url: "/v1/notification-preferences",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
      payload: [{ category: "VideoPublished", emailEnabled: false }],
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual(
      expect.arrayContaining([{ category: "VideoPublished", emailEnabled: false }]),
    )

    await app.close()
  })

  it("should reject an invalid category with 422", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "PUT",
      url: "/v1/notification-preferences",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
      payload: [{ category: "NotARealCategory", emailEnabled: false }],
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("INVALID_CATEGORY")

    await app.close()
  })
})
