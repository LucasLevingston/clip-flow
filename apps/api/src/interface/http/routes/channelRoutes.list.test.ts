import { Niche } from "../../../domain/catalog/entities/Niche"
import { buildTestServer } from "../../../test-utils/buildTestServer"

async function registerOwnerAndCreateChannel(app: ReturnType<typeof buildTestServer>["app"]) {
  const registerResponse = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
  })
  const accessToken = registerResponse.json().accessToken as string

  await app.inject({
    method: "POST",
    url: "/v1/channels",
    headers: { authorization: `Bearer ${accessToken}` },
    payload: {
      nicheId: "niche-1",
      name: "Meu Canal",
      language: "pt-BR",
      videosPerDay: 1,
      generationTime: "06:00",
      platforms: "SHORTS_ONLY",
      thumbnailEnabled: true,
    },
  })

  return accessToken
}

describe("GET /v1/channels", () => {
  it("should list the tenant's channels with niche names resolved", async () => {
    const { app, nicheRepository } = buildTestServer()
    nicheRepository.seed(
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
    const accessToken = await registerOwnerAndCreateChannel(app)

    const response = await app.inject({
      method: "GET",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().data).toEqual([
      expect.objectContaining({ name: "Meu Canal", nicheName: "Futebol", status: "DRAFT" }),
    ])
    expect(response.json().meta).toEqual({ page: 1, pageSize: 20, total: 1 })

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/channels" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid status filter", async () => {
    const { app } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
    })
    const accessToken = registerResponse.json().accessToken as string

    const response = await app.inject({
      method: "GET",
      url: "/v1/channels?status=GONE",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })
})
