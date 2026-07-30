import { buildTestServer } from "../../../test-utils/buildTestServer"

function mintToken(ctx: ReturnType<typeof buildTestServer>["ctx"], userId = "user-1") {
  return ctx.jwtService.signAccessToken({
    sub: userId,
    tenantId: "tenant-1",
    role: "OWNER",
    isPlatformAdmin: false,
  })
}

function seedNotification(
  repo: ReturnType<typeof buildTestServer>["notificationRepository"],
  overrides: Partial<{ id: string; userId: string; readAt: Date | null }> = {},
) {
  repo.seed({
    id: overrides.id ?? "notif-1",
    tenantId: "tenant-1",
    userId: overrides.userId ?? "user-1",
    category: "VideoPublished",
    payload: { generatedVideoId: "gv-1" },
    readAt: overrides.readAt ?? null,
    createdAt: new Date("2026-07-01"),
  })
}

describe("GET /v1/notifications", () => {
  it("should list the caller's notifications", async () => {
    const { app, notificationRepository, ctx } = buildTestServer()
    seedNotification(notificationRepository)

    const response = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toEqual([
      expect.objectContaining({ id: "notif-1", category: "VideoPublished" }),
    ])
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 1 })

    await app.close()
  })

  it("should not leak another user's notifications", async () => {
    const { app, notificationRepository, ctx } = buildTestServer()
    seedNotification(notificationRepository, { id: "notif-other", userId: "someone-else" })

    const response = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.json().data).toEqual([])

    await app.close()
  })

  it("should filter to unread only", async () => {
    const { app, notificationRepository, ctx } = buildTestServer()
    seedNotification(notificationRepository, { id: "notif-read", readAt: new Date() })
    seedNotification(notificationRepository, { id: "notif-unread", readAt: null })

    const response = await app.inject({
      method: "GET",
      url: "/v1/notifications?unreadOnly=true",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.json().data).toEqual([expect.objectContaining({ id: "notif-unread" })])

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/notifications" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})

describe("PATCH /v1/notifications/:id/read", () => {
  it("should mark the caller's notification as read", async () => {
    const { app, notificationRepository, ctx } = buildTestServer()
    seedNotification(notificationRepository)

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/notifications/notif-1/read",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().readAt).not.toBeNull()

    await app.close()
  })

  it("should 404 when the notification does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/notifications/ghost/read",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("NOTIFICATION_NOT_FOUND")

    await app.close()
  })

  it("should 404 when the notification belongs to another user", async () => {
    const { app, notificationRepository, ctx } = buildTestServer()
    seedNotification(notificationRepository, { userId: "someone-else" })

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/notifications/notif-1/read",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })
})
