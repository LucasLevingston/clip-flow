import { buildIdentityTestContext } from "../../../test-utils/buildIdentityTestContext"
import { GetCurrentUserUseCase } from "./GetCurrentUserUseCase"
import { RegisterTenantUseCase } from "./RegisterTenantUseCase"

function buildUseCase() {
  const ctx = buildIdentityTestContext()
  const registerUseCase = new RegisterTenantUseCase(ctx)
  const getCurrentUserUseCase = new GetCurrentUserUseCase(ctx)
  return { getCurrentUserUseCase, registerUseCase, ...ctx }
}

describe("GetCurrentUserUseCase", () => {
  it("should return the user, tenant and role for a valid pair", async () => {
    const { getCurrentUserUseCase, registerUseCase } = buildUseCase()
    const registered = await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "Minha Empresa",
    })

    const result = await getCurrentUserUseCase.execute({
      userId: registered.userId,
      tenantId: registered.tenantId,
    })

    expect(result?.user.email).toBe("marina@example.com")
    expect(result?.user.isPlatformAdmin).toBe(false)
    expect(result?.tenant.name).toBe("Minha Empresa")
    expect(result?.role).toBe("OWNER")
  })

  it("should return null when the user does not belong to the tenant", async () => {
    const { getCurrentUserUseCase, registerUseCase } = buildUseCase()
    const registered = await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    const result = await getCurrentUserUseCase.execute({
      userId: registered.userId,
      tenantId: "some-other-tenant",
    })

    expect(result).toBeNull()
  })
})
