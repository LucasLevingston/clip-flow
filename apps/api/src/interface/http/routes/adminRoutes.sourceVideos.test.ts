import { Niche } from "../../../domain/catalog/entities/Niche"
import { buildTestServer } from "../../../test-utils/buildTestServer"

function seedNiche(repo: ReturnType<typeof buildTestServer>["nicheRepository"]) {
  repo.seed(
    Niche.create({
      id: "niche-1",
      name: "Futebol",
      slug: "futebol",
      description: "desc",
      category: "Esportes",
      previewThumbnailUrl: null,
      status: "ACTIVE",
      createdAt: new Date(),
    }),
  )
}

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

function ingestPayload(overrides: Record<string, unknown> = {}) {
  return {
    nicheId: "niche-1",
    storageUrl: "s3://bucket/video.mp4",
    durationSeconds: 600,
    licenseType: "PUBLIC_DOMAIN",
    licenseReference: "https://example.com/license",
    ...overrides,
  }
}

describe("POST /v1/admin/source-videos", () => {
  it("should ingest a source video as a platform admin", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/source-videos",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: ingestPayload(),
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().status).toBe("PENDING_REVIEW")

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/source-videos",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
      payload: ingestPayload(),
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/source-videos",
      payload: ingestPayload(),
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should 404 when the niche does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/source-videos",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: ingestPayload({ nicheId: "ghost" }),
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("NICHE_NOT_FOUND")

    await app.close()
  })

  it("should reject an invalid payload", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/source-videos",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: {},
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })
})

describe("PATCH /v1/admin/source-videos/:id/review", () => {
  async function ingestSourceVideo(
    app: ReturnType<typeof buildTestServer>["app"],
    ctx: ReturnType<typeof buildTestServer>["ctx"],
  ) {
    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/source-videos",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: ingestPayload(),
    })
    return response.json().id as string
  }

  it("should approve a pending source video", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)
    const sourceVideoId = await ingestSourceVideo(app, ctx)

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/admin/source-videos/${sourceVideoId}/review`,
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe("APPROVED")

    await app.close()
  })

  it("should reject reviewing the same source video twice", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)
    const sourceVideoId = await ingestSourceVideo(app, ctx)
    await app.inject({
      method: "PATCH",
      url: `/v1/admin/source-videos/${sourceVideoId}/review`,
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/admin/source-videos/${sourceVideoId}/review`,
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe("SOURCE_VIDEO_NOT_PENDING")

    await app.close()
  })

  it("should 404 when the source video does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/source-videos/ghost/review",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { decision: "APPROVED" },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })
})
