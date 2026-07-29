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

async function getState(
  app: ReturnType<typeof buildTestServer>["app"],
  accessToken: string,
  channelId: string,
) {
  const response = await app.inject({
    method: "GET",
    url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-url`,
    headers: { authorization: `Bearer ${accessToken}` },
  })
  const url = new URL(response.json().url as string)
  return url.searchParams.get("state") as string
}

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

describe("POST /v1/channels/:channelId/social-accounts/:platform/oauth-callback", () => {
  it("should connect the account and activate the channel", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository)
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)
    const state = await getState(app, accessToken, channelId)

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-callback`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { code: "auth-code", state },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().status).toBe("CONNECTED")

    const channelResponse = await app.inject({
      method: "GET",
      url: `/v1/channels/${channelId}`,
      headers: { authorization: `Bearer ${accessToken}` },
    })
    expect(channelResponse.json().status).toBe("ACTIVE")

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels/ghost/social-accounts/youtube/oauth-callback",
      payload: { code: "x", state: "y" },
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid payload", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository)
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-callback`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {},
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should reject an invalid state", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository)
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-callback`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { code: "auth-code", state: "tampered" },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe("INVALID_OAUTH_STATE")

    await app.close()
  })

  it("should reject a failed code exchange", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository)
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)
    const state = await getState(app, accessToken, channelId)

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-callback`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { code: "invalid-code", state },
    })

    expect(response.statusCode).toBe(502)
    expect(response.json().error.code).toBe("OAUTH_EXCHANGE_FAILED")

    await app.close()
  })

  it("should reject connecting an already-connected platform", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedNiche(nicheRepository)
    const { accessToken, channelId } = await registerOwnerAndCreateChannel(app)
    const firstState = await getState(app, accessToken, channelId)
    await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-callback`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { code: "auth-code", state: firstState },
    })

    const response = await app.inject({
      method: "POST",
      url: `/v1/channels/${channelId}/social-accounts/youtube/oauth-callback`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { code: "auth-code", state: firstState },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe("SOCIAL_ACCOUNT_ALREADY_CONNECTED")

    await app.close()
  })
})
