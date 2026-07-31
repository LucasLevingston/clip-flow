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

function configPayload(overrides: Record<string, unknown> = {}) {
  return {
    providerType: "RSS_FEED",
    settings: { feedUrl: "https://partner.example.com/feed.xml" },
    name: "Partner Feed",
    licenseType: "PARTNER_AGREEMENT",
    licenseReference: "contract-123",
    ...overrides,
  }
}

describe("POST /v1/admin/niches/:id/content-sources", () => {
  it("should create a content source config", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/content-sources",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: configPayload(),
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().providerType).toBe("RSS_FEED")

    await app.close()
  })

  it("should reject a payload whose settings don't match the providerType", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/content-sources",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: configPayload({ settings: { folderPath: "/data" } }),
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should 404 when the niche does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/ghost/content-sources",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: configPayload(),
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })
})

describe("GET /v1/admin/niches/:id/content-sources", () => {
  it("should list the configs created for a niche", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)
    await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/content-sources",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: configPayload(),
    })

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/niches/niche-1/content-sources",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(1)

    await app.close()
  })
})

describe("POST /v1/admin/niches/:id/content-sources/discover", () => {
  it("should run active sources and ingest new candidates", async () => {
    const { app, nicheRepository, ctx, rssProvider } = buildTestServer()
    seedNiche(nicheRepository)
    await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/content-sources",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: configPayload(),
    })
    rssProvider.candidates = [
      { externalRef: "ep-1", storageUrl: "https://cdn.example.com/ep-1.mp4", durationSeconds: 90 },
    ]

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/niche-1/content-sources/discover",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ discovered: 1, ingested: 1, skipped: 0, failedSources: [] })

    await app.close()
  })

  it("should 404 when the niche does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches/ghost/content-sources/discover",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })
})
