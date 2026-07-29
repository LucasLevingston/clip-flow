import { EmailAlreadyExistsError } from "../../../domain/identity/errors/EmailAlreadyExistsError"
import { buildIdentityTestContext } from "../../../test-utils/buildIdentityTestContext"
import { RegisterTenantUseCase } from "./RegisterTenantUseCase"

function buildUseCase() {
  const ctx = buildIdentityTestContext()
  const useCase = new RegisterTenantUseCase(ctx)
  return { useCase, ...ctx }
}

describe("RegisterTenantUseCase", () => {
  it("should create a user, tenant, owner membership, trial subscription and a session", async () => {
    const { useCase, tenantRepository, membershipRepository, subscriptionRepository } =
      buildUseCase()

    const result = await useCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "Minha Empresa",
    })

    const tenant = await tenantRepository.findById(result.tenantId)
    const membership = await membershipRepository.findByTenantAndUser(
      result.tenantId,
      result.userId,
    )

    expect(tenant?.name).toBe("Minha Empresa")
    expect(membership?.isOwner()).toBe(true)
    expect(subscriptionRepository.trialTenantIds.has(result.tenantId)).toBe(true)
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it("should never persist the plain-text password", async () => {
    const { useCase, userRepository } = buildUseCase()

    const result = await useCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    const user = await userRepository.findById(result.userId)
    expect(user?.passwordHash).not.toBe("Senha123")
    expect(user?.passwordHash).toBe("hashed:Senha123")
  })

  it("should reject registration when the e-mail is already taken", async () => {
    const { useCase } = buildUseCase()
    await useCase.execute({ email: "marina@example.com", password: "Senha123", tenantName: "X" })

    await expect(
      useCase.execute({ email: "marina@example.com", password: "Outra123", tenantName: "Y" }),
    ).rejects.toThrow(EmailAlreadyExistsError)
  })
})
