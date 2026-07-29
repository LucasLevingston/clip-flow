import { InMemoryRefreshTokenRepository } from "../../test-utils/fakes/InMemoryRefreshTokenRepository"
import { FakeClock } from "../../test-utils/fakes/FakeClock"
import { FakeJwtService } from "../../test-utils/fakes/FakeJwtService"
import { FakeRefreshTokenHasher } from "../../test-utils/fakes/FakeRefreshTokenHasher"
import { FakeSecureTokenGenerator } from "../../test-utils/fakes/FakeSecureTokenGenerator"
import { SessionIssuer } from "./SessionIssuer"

function buildIssuer() {
  const refreshTokenRepository = new InMemoryRefreshTokenRepository()
  const clock = new FakeClock()
  const issuer = new SessionIssuer({
    jwtService: new FakeJwtService(),
    refreshTokenRepository,
    refreshTokenHasher: new FakeRefreshTokenHasher(),
    secureTokenGenerator: new FakeSecureTokenGenerator(),
    clock,
  })
  return { issuer, refreshTokenRepository, clock }
}

describe("SessionIssuer", () => {
  it("should issue an access token encoding the session claims", async () => {
    const { issuer } = buildIssuer()

    const session = await issuer.issue({
      userId: "u1",
      tenantId: "t1",
      role: "OWNER",
      isPlatformAdmin: false,
    })

    expect(session.accessToken).toContain('"sub":"u1"')
    expect(session.accessToken).toContain('"tenantId":"t1"')
  })

  it("should persist the hashed refresh token, not the raw one", async () => {
    const { issuer, refreshTokenRepository } = buildIssuer()

    const session = await issuer.issue({
      userId: "u1",
      tenantId: "t1",
      role: "MEMBER",
      isPlatformAdmin: false,
    })

    const stored = await refreshTokenRepository.findByTokenHash(`hashed:${session.refreshToken}`)
    expect(stored).not.toBeNull()
    expect(stored?.userId).toBe("u1")
  })

  it("should set the refresh token to expire 7 days from now", async () => {
    const { issuer, refreshTokenRepository, clock } = buildIssuer()

    const session = await issuer.issue({
      userId: "u1",
      tenantId: "t1",
      role: "MEMBER",
      isPlatformAdmin: false,
    })

    const stored = await refreshTokenRepository.findByTokenHash(`hashed:${session.refreshToken}`)
    const expectedExpiry = clock.now().getTime() + 7 * 24 * 60 * 60 * 1000
    expect(stored?.expiresAt.getTime()).toBe(expectedExpiry)
  })
})
