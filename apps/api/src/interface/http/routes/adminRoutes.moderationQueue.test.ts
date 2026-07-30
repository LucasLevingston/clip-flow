import { buildTestServer } from "../../../test-utils/buildTestServer"

function mintAdminToken(ctx: ReturnType<typeof buildTestServer>["ctx"]) {
  return ctx.jwtService.signAccessToken({
    sub: "admin-user-1",
    tenantId: "tenant-1",
    role: "OWNER",
    isPlatformAdmin: true,
  })
}

function mintNonAdminToken(ctx: ReturnType<typeof buildTestServer>["ctx"]) {
  return ctx.jwtService.signAccessToken({
    sub: "user-1",
    tenantId: "tenant-1",
    role: "OWNER",
    isPlatformAdmin: false,
  })
}

function seedFlaggedVideo(repo: ReturnType<typeof buildTestServer>["generatedVideoRepository"]) {
  repo.seed({
    id: "generated-1",
    channelId: "channel-1",
    status: "PENDING_MODERATION",
    flagReason: "violence",
    createdAt: new Date("2026-07-01"),
  })
}

describe("GET /v1/admin/moderation-queue", () => {
  it("should list flagged videos as a platform admin", async () => {
    const { app, generatedVideoRepository, ctx } = buildTestServer()
    seedFlaggedVideo(generatedVideoRepository)

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/moderation-queue",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toEqual([
      {
        id: "generated-1",
        channelId: "channel-1",
        flagReason: "violence",
        createdAt: expect.any(String),
      },
    ])
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 1 })

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/moderation-queue",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/admin/moderation-queue" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})

describe("PATCH /v1/admin/moderation-queue/:generatedVideoId", () => {
  it("should approve a flagged video and publish VideoContentGenerated", async () => {
    const { app, generatedVideoRepository, videoContentEventPublisher, ctx } = buildTestServer()
    seedFlaggedVideo(generatedVideoRepository)

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/moderation-queue/generated-1",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe("CONTENT_READY")
    expect(videoContentEventPublisher.published).toEqual([{ generatedVideoId: "generated-1" }])

    await app.close()
  })

  it("should reject a flagged video without publishing an event", async () => {
    const { app, generatedVideoRepository, videoContentEventPublisher, ctx } = buildTestServer()
    seedFlaggedVideo(generatedVideoRepository)

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/moderation-queue/generated-1",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "REJECTED", reason: "Still unsafe" },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe("REJECTED")
    expect(videoContentEventPublisher.published).toEqual([])

    await app.close()
  })

  it("should reject reviewing the same video twice", async () => {
    const { app, generatedVideoRepository, ctx } = buildTestServer()
    seedFlaggedVideo(generatedVideoRepository)
    await app.inject({
      method: "PATCH",
      url: "/v1/admin/moderation-queue/generated-1",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/moderation-queue/generated-1",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe("VIDEO_NOT_PENDING_MODERATION")

    await app.close()
  })

  it("should 404 when the video does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/moderation-queue/ghost",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("VIDEO_NOT_FOUND")

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, generatedVideoRepository, ctx } = buildTestServer()
    seedFlaggedVideo(generatedVideoRepository)

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/moderation-queue/generated-1",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })
})
