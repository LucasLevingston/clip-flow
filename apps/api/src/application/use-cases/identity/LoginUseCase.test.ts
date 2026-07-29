import { InvalidCredentialsError } from "../../../domain/identity/errors/InvalidCredentialsError"
import { User } from "../../../domain/identity/entities/User"
import { buildIdentityTestContext } from "../../../test-utils/buildIdentityTestContext"
import { LoginUseCase } from "./LoginUseCase"
import { RegisterTenantUseCase } from "./RegisterTenantUseCase"

function buildUseCase() {
  const ctx = buildIdentityTestContext()
  const registerUseCase = new RegisterTenantUseCase(ctx)
  const loginUseCase = new LoginUseCase(ctx)
  return { loginUseCase, registerUseCase, ...ctx }
}

describe("LoginUseCase", () => {
  it("should log in with the correct credentials and return a session for the owner tenant", async () => {
    const { loginUseCase, registerUseCase } = buildUseCase()
    const registered = await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    const result = await loginUseCase.execute({ email: "marina@example.com", password: "Senha123" })

    expect(result.userId).toBe(registered.userId)
    expect(result.tenantId).toBe(registered.tenantId)
    expect(result.accessToken).toBeDefined()
  })

  it("should reject login for an unknown e-mail", async () => {
    const { loginUseCase } = buildUseCase()

    await expect(
      loginUseCase.execute({ email: "ghost@example.com", password: "Senha123" }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it("should reject login with the wrong password", async () => {
    const { loginUseCase, registerUseCase } = buildUseCase()
    await registerUseCase.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    await expect(
      loginUseCase.execute({ email: "marina@example.com", password: "Errada123" }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it("should reject login for a user with no membership in any tenant", async () => {
    const { loginUseCase, userRepository, passwordHasher } = buildUseCase()
    const orphanUser = User.create({
      id: "orphan",
      email: "orphan@example.com",
      passwordHash: await passwordHasher.hash("Senha123"),
    })
    await userRepository.save(orphanUser)

    await expect(
      loginUseCase.execute({ email: "orphan@example.com", password: "Senha123" }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})
