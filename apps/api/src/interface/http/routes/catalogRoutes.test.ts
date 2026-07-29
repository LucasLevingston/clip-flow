import { Niche } from "../../../domain/catalog/entities/Niche"
import { buildTestServer } from "../../../test-utils/buildTestServer"

function seedNiche(
  repo: ReturnType<typeof buildTestServer>["nicheRepository"],
  overrides: Partial<{
    id: string
    name: string
    slug: string
    category: string
    status: "ACTIVE" | "INACTIVE"
  }>,
) {
  repo.seed(
    Niche.create({
      id: overrides.id ?? "niche-1",
      name: overrides.name ?? "Futebol",
      slug: overrides.slug ?? "futebol",
      description: "desc",
      category: overrides.category ?? "Esportes",
      previewThumbnailUrl: null,
      status: overrides.status ?? "ACTIVE",
      createdAt: new Date(),
    }),
  )
}

async function registerAndGetToken(app: ReturnType<typeof buildTestServer>["app"]) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email: "marina@example.com", password: "Senha123", tenantName: "X" },
  })
  return response.json().accessToken as string
}

describe("GET /v1/niches", () => {
  it("should list active niches for an authenticated user", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository, { id: "niche-1", name: "Futebol" })
    seedNiche(nicheRepository, { id: "niche-2", name: "Rascunho", status: "INACTIVE" })
    const accessToken = await registerAndGetToken(app)

    const response = await app.inject({
      method: "GET",
      url: "/v1/niches",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().data).toHaveLength(1)
    expect(response.json().meta).toEqual({ page: 1, pageSize: 20, total: 1 })

    await app.close()
  })

  it("should reject listing niches without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/niches" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid pageSize", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerAndGetToken(app)

    const response = await app.inject({
      method: "GET",
      url: "/v1/niches?pageSize=101",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })
})

describe("GET /v1/niches/:nicheId", () => {
  it("should return niche detail for an authenticated user", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository, { id: "niche-1", name: "Futebol" })
    const accessToken = await registerAndGetToken(app)

    const response = await app.inject({
      method: "GET",
      url: "/v1/niches/niche-1",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().name).toBe("Futebol")

    await app.close()
  })

  it("should reject fetching a niche without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/niches/niche-1" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should 404 when the niche does not exist", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerAndGetToken(app)

    const response = await app.inject({
      method: "GET",
      url: "/v1/niches/ghost",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("NICHE_NOT_FOUND")

    await app.close()
  })
})
