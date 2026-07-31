import { Niche } from "../../../domain/catalog/entities/Niche"
import { buildTestServer } from "../../../test-utils/buildTestServer"

function seedNiche(nicheRepository: ReturnType<typeof buildTestServer>["nicheRepository"]) {
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
}

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

async function connectYoutube(
  app: ReturnType<typeof buildTestServer>["app"],
  accessToken: string,
  channelId: string,
) {
  const oauthUrlResponse = await app.inject({
    method: "GET",
    url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-url`,
    headers: { authorization: `Bearer ${accessToken}` },
  })
  const state = new URL(oauthUrlResponse.json().url as string).searchParams.get("state") as string
  await app.inject({
    method: "POST",
    url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-callback`,
    headers: { authorization: `Bearer ${accessToken}` },
    payload: { code: "auth-code", state },
  })
}

describe("POST /v1/channels/:channelId/generate-now", () => {
  it("should enqueue a GenerationBatch job for an active channel", async () => {
    const { app, nicheRepository, generationTriggerPublisher } = buildTestServer()
    seedNiche(nicheRepository)
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)
    await connectYoutube(app, accessToken, channelId)

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/generate-now`,
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(202)
    expect(generationTriggerPublisher.published).toHaveLength(1)
    expect(generationTriggerPublisher.published[0]).toMatchObject({ channelId })

    await app.close()
  })

  it("should reject a channel that is still DRAFT", async () => {
    const { app, nicheRepository, generationTriggerPublisher } = buildTestServer()
    seedNiche(nicheRepository)
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/generate-now`,
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe("CHANNEL_NOT_ACTIVE")
    expect(generationTriggerPublisher.published).toHaveLength(0)

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels/ghost/generate-now",
    })

    expect(response.statusCode).toBe(401)

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
      method: "POST",
      url: "/v1/channels/ghost/generate-now",
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })

  it("should reject a channel belonging to another tenant", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository)
    const owner1 = await registerOwnerAndCreateChannel(app)
    await connectYoutube(app, owner1.accessToken, owner1.channelId)

    const owner2Register = await app.inject({
      method: "POST",
      url: "/v1/auth/register",
      payload: { email: "owner2@example.com", password: "Senha123", tenantName: "Other Studio" },
    })
    const owner2AccessToken = owner2Register.json().accessToken as string

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${owner1.channelId}/generate-now`,
      headers: { authorization: `Bearer ${owner2AccessToken}` },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })
})
