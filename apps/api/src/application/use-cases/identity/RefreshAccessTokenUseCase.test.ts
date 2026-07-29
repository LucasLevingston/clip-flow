import { RefreshTokenInvalidError } from "../../../domain/identity/errors/RefreshTokenInvalidError"
import { buildIdentityTestContext } from "../../../test-utils/buildIdentityTestContext"
import { RefreshAccessTokenUseCase } from "./RefreshAccessTokenUseCase"
import { RegisterTenantUseCase } from "./RegisterTenantUseCase"

function buildUseCase() {
  const ctx = buildIdentityTestContext()
  const registerUseCase = new RegisterTenantUseCase(ctx)
  const refreshUseCase = new RefreshAccessTokenUseCase(ctx)
  return { refreshUseCase, registerUseCase, ...ctx }
}

describe("RefreshAccessTokenUseCase", () => {
  it("should issue a new session from a valid refresh token", async () => {
    const { refreshUseCase, registerUseCase } = buildUseCase()
    const registered = await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    const refreshed = await refreshUseCase.execute({ refreshToken: registered.refreshToken })

    expect(refreshed.accessToken).toBeDefined()
    expect(refreshed.refreshToken).not.toBe(registered.refreshToken)
  })

  it("should rotate the refresh token, invalidating the old one", async () => {
    const { refreshUseCase, registerUseCase } = buildUseCase()
    const registered = await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    await refreshUseCase.execute({ refreshToken: registered.refreshToken })

    await expect(refreshUseCase.execute({ refreshToken: registered.refreshToken })).rejects.toThrow(
      RefreshTokenInvalidError,
    )
  })

  it("should reject an unknown refresh token", async () => {
    const { refreshUseCase } = buildUseCase()

    await expect(refreshUseCase.execute({ refreshToken: "never-issued" })).rejects.toThrow(
      RefreshTokenInvalidError,
    )
  })

  it("should reject an expired refresh token", async () => {
    const { refreshUseCase, registerUseCase, clock } = buildUseCase()
    const registered = await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    clock.advanceMs(8 * 24 * 60 * 60 * 1000)

    await expect(refreshUseCase.execute({ refreshToken: registered.refreshToken })).rejects.toThrow(
      RefreshTokenInvalidError,
    )
  })

  it("should reject a refresh token whose user has no membership left", async () => {
    const { refreshUseCase, refreshTokenRepository, refreshTokenHasher } = buildUseCase()
    const rawToken = "orphan-raw-token"
    await refreshTokenRepository.create({
      userId: "user-without-membership",
      tokenHash: refreshTokenHasher.hash(rawToken),
      deviceInfo: null,
      expiresAt: new Date("2099-01-01T00:00:00Z"),
    })

    await expect(refreshUseCase.execute({ refreshToken: rawToken })).rejects.toThrow(
      RefreshTokenInvalidError,
    )
  })
})
