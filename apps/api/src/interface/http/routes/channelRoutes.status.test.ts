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

describe("PATCH /v1/channels/:channelId/status", () => {
  it("should pause an active channel and reactivate it", async () => {
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
    await connectYoutube(app, accessToken, channelId)

    const pauseResponse = await app.inject({
      method: "PATCH",
      url: `/v1/channels/${channelId}/status`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { status: "PAUSED" },
    })
    expect(pauseResponse.statusCode).toBe(200)
    expect(pauseResponse.json().status).toBe("PAUSED")

    const resumeResponse = await app.inject({
      method: "PATCH",
      url: `/v1/channels/${channelId}/status`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { status: "ACTIVE" },
    })
    expect(resumeResponse.statusCode).toBe(200)
    expect(resumeResponse.json().status).toBe("ACTIVE")

    await app.close()
  })

  it("should reject activating a channel without a connected social account", async () => {
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
      method: "PATCH",
      url: `/v1/channels/${channelId}/status`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { status: "ACTIVE" },
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("CHANNEL_NOT_READY")

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/channels/ghost/status",
      payload: { status: "ACTIVE" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid status value", async () => {
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
      method: "PATCH",
      url: `/v1/channels/${channelId}/status`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { status: "DRAFT" },
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
      method: "PATCH",
      url: "/v1/channels/ghost/status",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { status: "PAUSED" },
    })

    expect(response.statusCode).toBe(404)

    await app.close()
  })
})
