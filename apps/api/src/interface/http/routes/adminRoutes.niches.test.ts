import { Niche } from "../../../domain/catalog/entities/Niche"
import { buildTestServer } from "../../../test-utils/buildTestServer"

function seedNiche(
  repo: ReturnType<typeof buildTestServer>["nicheRepository"],
  overrides: Partial<{
    id: string
    slug: string
    status: "ACTIVE" | "INACTIVE"
  }> = {},
) {
  repo.seed(
    Niche.create({
      id: overrides.id ?? "niche-1",
      name: "Futebol",
      slug: overrides.slug ?? "futebol",
      description: "desc",
      category: "Esportes",
      previewThumbnailUrl: null,
      status: overrides.status ?? "ACTIVE",
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

function createNichePayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Basquete",
    slug: "basquete",
    description: "Vídeos de basquete",
    category: "Esportes",
    ...overrides,
  }
}

describe("POST /v1/admin/niches", () => {
  it("should create a niche as a platform admin", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: createNichePayload(),
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body).toMatchObject({ name: "Basquete", slug: "basquete", status: "INACTIVE" })

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
      payload: createNichePayload(),
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches",
      payload: createNichePayload(),
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid payload", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { name: "" },
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should 409 when the slug already exists", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository, { slug: "basquete" })

    const response = await app.inject({
      method: "POST",
      url: "/v1/admin/niches",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: createNichePayload({ slug: "basquete" }),
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe("SLUG_ALREADY_EXISTS")

    await app.close()
  })
})

describe("GET /v1/admin/niches", () => {
  it("should list niches including INACTIVE ones as a platform admin", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository, { id: "n1", slug: "futebol", status: "ACTIVE" })
    seedNiche(nicheRepository, { id: "n2", slug: "basquete-2", status: "INACTIVE" })

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/niches",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 2 })
    expect(body.data).toHaveLength(2)

    await app.close()
  })

  it("should filter by status", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository, { id: "n1", slug: "futebol", status: "ACTIVE" })
    seedNiche(nicheRepository, { id: "n2", slug: "basquete-2", status: "INACTIVE" })

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/niches?status=INACTIVE",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.data).toHaveLength(1)
    expect(body.data[0].id).toBe("n2")

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/niches",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })
})

describe("PATCH /v1/admin/niches/:id", () => {
  it("should update a niche as a platform admin", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/niches/niche-1",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { status: "INACTIVE" },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe("INACTIVE")

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, nicheRepository, ctx } = buildTestServer()
    seedNiche(nicheRepository)

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/niches/niche-1",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
      payload: { status: "INACTIVE" },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })

  it("should 404 when the niche does not exist", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/admin/niches/ghost",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
      payload: { status: "INACTIVE" },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("NICHE_NOT_FOUND")

    await app.close()
  })
})
