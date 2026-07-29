import { Niche } from "../../../domain/catalog/entities/Niche"
import { buildTestServer } from "../../../test-utils/buildTestServer"

function seedActiveNiche(
  repo: ReturnType<typeof buildTestServer>["nicheRepository"],
  id = "niche-1",
) {
  repo.seed(
    Niche.create({
      id,
      name: "Futebol",
      slug: `futebol-${id}`,
      description: "desc",
      category: "Esportes",
      previewThumbnailUrl: null,
      status: "ACTIVE",
      createdAt: new Date(),
    }),
  )
}

async function registerOwner(app: ReturnType<typeof buildTestServer>["app"]) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register",
    payload: { email: "owner@example.com", password: "Senha123", tenantName: "Studio" },
  })
  return response.json().accessToken as string
}

function createChannelPayload(overrides: Record<string, unknown> = {}) {
  return {
    nicheId: "niche-1",
    name: "Meu Canal",
    language: "pt-BR",
    videosPerDay: 1,
    generationTime: "06:00",
    platforms: "SHORTS_ONLY",
    thumbnailEnabled: true,
    ...overrides,
  }
}

describe("POST /v1/channels", () => {
  it("should create a channel in DRAFT status", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedActiveNiche(nicheRepository)
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: createChannelPayload(),
    })

    expect(response.statusCode).toBe(201)
    expect(response.json().status).toBe("DRAFT")
    expect(response.json().publishTimes).toHaveLength(1)

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels",
      payload: createChannelPayload(),
    })

    expect(response.statusCode).toBe(401)

    await app.close()
  })

  it("should reject an invalid payload", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { name: "Meu Canal" },
    })

    expect(response.statusCode).toBe(422)

    await app.close()
  })

  it("should reject an inactive/unknown niche", async () => {
    const { app } = buildTestServer()
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: createChannelPayload({ nicheId: "ghost-niche" }),
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("NICHE_INACTIVE")

    await app.close()
  })

  it("should reject a publishTimes count mismatch", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedActiveNiche(nicheRepository)
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: createChannelPayload({ publishTimes: ["09:00", "12:00"] }),
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("PUBLISH_TIMES_COUNT_MISMATCH")

    await app.close()
  })

  it("should reject videosPerDay above the plan's per-channel limit", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedActiveNiche(nicheRepository)
    const accessToken = await registerOwner(app)

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: createChannelPayload({ videosPerDay: 2 }),
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("PLAN_LIMIT_EXCEEDED")

    await app.close()
  })

  it("should reject creating a channel beyond the plan's limit", async () => {
    const { app, nicheRepository } = buildTestServer()
    seedActiveNiche(nicheRepository, "niche-1")
    const accessToken = await registerOwner(app)
    await app.inject({
      method: "POST",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: createChannelPayload(),
    })

    const response = await app.inject({
      method: "POST",
      url: "/v1/channels",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: createChannelPayload(),
    })

    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe("PLAN_LIMIT_EXCEEDED")

    await app.close()
  })
})
