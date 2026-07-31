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

describe("GET /v1/channels/:channelId/insights", () => {
  it("should return the most recent ChannelInsights", async () => {
    const { app, nicheRepository, channelInsightsRepository } = buildTestServer()
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
    channelInsightsRepository.seed(channelId, {
      bestPublishHours: [9, 20],
      topTitlePatterns: ["incrivel"],
      topHashtags: ["#futebol"],
      avgOptimalDurationMs: 31_000,
      computedAt: new Date("2026-07-30T00:00:00Z"),
    })

    const response = await app.inject({
      method: "GET",
      url: `/v1/channels/${channelId}/insights`,
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().bestPublishHours).toEqual([9, 20])

    await app.close()
  })

  it("should return 204 when no insight has been computed yet", async () => {
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
      url: `/v1/channels/${channelId}/insights`,
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe("")

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
      url: "/v1/channels/ghost/insights",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe("CHANNEL_NOT_FOUND")

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/channels/ghost/insights" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})
