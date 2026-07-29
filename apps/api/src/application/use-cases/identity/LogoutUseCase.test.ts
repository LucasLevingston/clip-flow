import { buildIdentityTestContext } from "../../../test-utils/buildIdentityTestContext"
import { LogoutUseCase } from "./LogoutUseCase"
import { RegisterTenantUseCase } from "./RegisterTenantUseCase"

function buildUseCase() {
  const ctx = buildIdentityTestContext()
  const registerUseCase = new RegisterTenantUseCase(ctx)
  const logoutUseCase = new LogoutUseCase(ctx)
  return { logoutUseCase, registerUseCase, ...ctx }
}

describe("LogoutUseCase", () => {
  it("should revoke the refresh token so it can no longer be used", async () => {
    const { logoutUseCase, registerUseCase, refreshTokenRepository, refreshTokenHasher } =
      buildUseCase()
    const registered = await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    await logoutUseCase.execute({ refreshToken: registered.refreshToken })

    const record = await refreshTokenRepository.findByTokenHash(
      refreshTokenHasher.hash(registered.refreshToken),
    )
    expect(record?.revokedAt).not.toBeNull()
  })

  it("should be idempotent for an unknown refresh token", async () => {
    const { logoutUseCase } = buildUseCase()

    await expect(logoutUseCase.execute({ refreshToken: "never-issued" })).resolves.toBeUndefined()
  })
})
