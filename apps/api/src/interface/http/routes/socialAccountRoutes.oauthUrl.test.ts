import { Niche } from "../../../domain/catalog/entities/Niche"
import { buildTestServer } from "../../../test-utils/buildTestServer"

async function registerOwnerAndCreateChannel(app: ReturnType<typeof buildTestServer>["app"]) {
  const registerResponse = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
  })
  const accessToken = registerResponse.json().accessToken as string

  const createResponse = await app.inject({
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

  return { accessToken, channelId: createResponse.json().id as string }
}

describe("GET /v1/channels/:channelId/social-accounts/:platform/oauth-url", () => {
  it("should return an authorization URL for YouTube", async () => {
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
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)

    const response = await app.inject({
      method: "GET",
      url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-url`,
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().url).toContain("state=")

    await app.close()
  })

  it("should return an authorization URL for TikTok", async () => {
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
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)

    const response = await app.inject({
      method: "GET",
      url: `/v1/channels/${channelId}/social-accounts/tiktok/oauth-url`,
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().url).toContain("state=")

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/channels/ghost/social-accounts/youtube/oauth-url",
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an unsupported platform", async () => {
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
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)

    const response = await app.inject({
      method: "GET",
      url: `/v1/channels/${channelId}/social-accounts/twitter/oauth-url`,
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should 404 when the channel does not exist", async () => {
    const { app } = buildTestServer()
    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
    })
    const accessToken = registerResponse.json().accessToken as string

    const response = await app.inject({
      method: "GET",
      url: "/v1/channels/ghost/social-accounts/youtube/oauth-url",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })
})
