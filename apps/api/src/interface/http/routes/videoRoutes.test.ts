import { buildTestServer } from "../../../test-utils/buildTestServer"

function mintToken(
  ctx: ReturnType<typeof buildTestServer>["ctx"],
  role: "OWNER" | "ADMIN" | "MEMBER" = "OWNER",
) {
  return ctx.jwtService.signAccessToken({
    sub: "user-1",
    tenantId: "tenant-1",
    role,
    isPlatformAdmin: false,
  })
}

describe("GET /v1/videos", () => {
  it("should list the tenant's videos", async () => {
    const { app, videoRepository, ctx } = buildTestServer()
    videoRepository.seedSummary({
      id: "video-1",
      channelId: "channel-1",
      status: "PUBLISHED",
      sourceVideoId: "source-1",
      thumbnailUrl: null,
      finalAssetUrl: null,
      scheduledPublishAt: new Date("2026-07-01"),
      createdAt: new Date("2026-07-01"),
      publishRecords: [],
    })

    const response = await app.inject({
      method: "GET",
      url: "/v1/videos",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().data).toHaveLength(1)
    expect(response.json().meta).toEqual({ page: 1, pageSize: 20, total: 1 })

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/videos" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})

describe("GET /v1/videos/:id", () => {
  it("should return the video detail", async () => {
    const { app, videoRepository, ctx } = buildTestServer()
    videoRepository.seedDetail("tenant-1", {
      id: "video-1",
      channelId: "channel-1",
      status: "PUBLISHED",
      highlight: { startMs: 0, endMs: 30_000 },
      copy: { title: "T", description: "D", hashtags: ["#a"], cta: "Segue" },
      thumbnailUrl: null,
      finalAssetUrl: "https://cdn/final.mp4",
      scheduledPublishAt: new Date("2026-07-01"),
      createdAt: new Date("2026-07-01"),
      publishRecords: [],
    })

    const response = await app.inject({
      method: "GET",
      url: "/v1/videos/video-1",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().id).toBe("video-1")

    await app.close()
  })

  it("should 404 when the video does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/videos/ghost",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("VIDEO_NOT_FOUND")

    await app.close()
  })
})

describe("GET /v1/videos/export", () => {
  it("should return a CSV as an OWNER", async () => {
    const { app, videoRepository, ctx } = buildTestServer()
    videoRepository.exportRows = [
      {
        id: "video-1",
        channel: "Canal",
        status: "PUBLISHED",
        platform: "YOUTUBE",
        publishedAt: new Date("2026-07-01T00:00:00.000Z"),
        views: 10,
        likes: 1,
        comments: 0,
      },
    ]

    const response = await app.inject({
      method: "GET",
      url: "/v1/videos/export",
      headers: { authorization: `Bearer ${mintToken(ctx, "OWNER")}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toContain("text/csv")
    expect(response.body).toContain("id,channel,status,platform,publishedAt,views,likes,comments")

    await app.close()
  })

  it("should reject a MEMBER role", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/videos/export",
      headers: { authorization: `Bearer ${mintToken(ctx, "MEMBER")}` },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })
})
