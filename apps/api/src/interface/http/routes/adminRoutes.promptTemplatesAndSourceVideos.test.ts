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

describe("POST /v1/admin/niches/:id/prompt-templates", () => {
  it("should create version 1 as a platform admin", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/prompt-templates",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { type: "HIGHLIGHT_SELECTION", content: "Selecione os melhores momentos" },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      nicheId: "niche-1",
      type: "HIGHLIGHT_SELECTION",
      version: 1,
    })

    await app.close()
  })

  it("should increment the version on a second save for the same type", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)
    await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/prompt-templates",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { type: "HIGHLIGHT_SELECTION", content: "v1" },
    })

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/prompt-templates",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { type: "HIGHLIGHT_SELECTION", content: "v2" },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().version).toBe(2)

    await app.close()
  })

  it("should 404 when the niche does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/ghost/prompt-templates",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { type: "HIGHLIGHT_SELECTION", content: "v1" },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/prompt-templates",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
      payload: { type: "HIGHLIGHT_SELECTION", content: "v1" },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })
})

describe("GET /v1/admin/source-videos", () => {
  it("should list source videos filtered by status as a platform admin", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)
    await app.inject({
      method: "POST",
      url: "/v1/admin/source-videos",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: {
        nicheId: "niche-1",
        storageUrl: "s3://bucket/video.mp4",
        durationSeconds: 600,
        licenseType: "PUBLIC_DOMAIN",
        licenseReference: "https://example.com/license",
      },
    })

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/source-videos?status=PENDING_REVIEW",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 1 })
    expect(body.data).toHaveLength(1)
    expect(body.data[0]).toMatchObject({ nicheId: "niche-1", status: "PENDING_REVIEW" })

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/source-videos",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })

  it("should reject an invalid status filter", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/source-videos?status=UNKNOWN",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })
})
