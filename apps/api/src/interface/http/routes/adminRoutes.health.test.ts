import { buildTestServer } from "../../../test-utils/buildTestServer"

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

describe("GET /v1/admin/health", () => {
  it("should return empty queues/integrations when no snapshot has been written yet", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/health",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ queues: [], integrations: [] })

    await app.close()
  })

  it("should return the latest snapshot as a platform admin", async () => {
    const { app, platformHealthSnapshotRepository, ctx } = buildTestServer()
    platformHealthSnapshotRepository.seed({
      queues: [{ name: "video", waiting: 3, active: 1, failed: 0 }],
      integrations: [
        { name: "youtube", status: "UP" },
        { name: "tiktok", status: "DEGRADED" },
      ],
    })

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/health",
      headers: { authorization: `Bearer ${mintAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      queues: [{ name: "video", waiting: 3, active: 1, failed: 0 }],
      integrations: [
        { name: "youtube", status: "UP" },
        { name: "tiktok", status: "DEGRADED" },
      ],
    })

    await app.close()
  })

  it("should reject a non-platform-admin caller", async () => {
    const { app, ctx } = buildTestServer()

    const response = await app.inject({
      method: "GET",
      url: "/v1/admin/health",
      headers: { authorization: `Bearer ${mintNonAdminToken(ctx)}` },
    })

    expect(response.statusCode).toBe(403)

    await app.close()
  })

  it("should reject without an access token", async () => {
    const { app } = buildTestServer()

    const response = await app.inject({ method: "GET", url: "/v1/admin/health" })

    expect(response.statusCode).toBe(401)

    await app.close()
  })
})
