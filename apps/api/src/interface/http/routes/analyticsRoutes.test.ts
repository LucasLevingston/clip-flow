import { buildTestServer } from "../../../test-utils/buildTestServer"

function mintToken(ctx: ReturnType<typeof buildTestServer>["ctx"]) {
  return ctx.jwtService.signAccessToken({
    sub: "user-1",
    tenantId: "tenant-1",
    role: "MEMBER",
    isPlatformAdmin: false,
  })
}

describe("GET /v1/analytics/summary", () => {
  it("should return the aggregated summary", async () => {
    const { app, analyticsQueryRepository, ctx } = buildTestServer()
    analyticsQueryRepository.summaryToReturn = {
      totalVideos: 1,
      totalViews: 100,
      totalLikes: 10,
      totalComments: 5,
      totalShares: 2,
      subscribersGrowth: 0,
      byPlatform: { YOUTUBE: { videos: 1, views: 100 }, TIKTOK: { videos: 0, views: 0 } },
      topVideos: [{ generatedVideoId: "video-1", views: 100 }],
    }

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/summary",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().totalViews).toBe(100)

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/analytics/summary" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})

describe("GET /v1/analytics/videos/:generatedVideoId/timeseries", () => {
  it("should return the video's timeseries", async () => {
    const { app, analyticsQueryRepository, ctx } = buildTestServer()
    analyticsQueryRepository.seedTimeseries("video-1", [
      { collectedAt: new Date("2026-07-01"), views: 10, likes: 1, comments: 0 },
    ])

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/videos/video-1/timeseries",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(1)

    await app.close()
  })

  it("should 404 when the video does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/analytics/videos/ghost/timeseries",
      headers: { authorization: `Bearer ${mintToken(ctx)}` },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("VIDEO_NOT_FOUND")

    await app.close()
  })
})
