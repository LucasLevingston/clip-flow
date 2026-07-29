import { MembershipAlreadyExistsError } from "../../../domain/identity/errors/MembershipAlreadyExistsError"
import { buildIdentityTestContext } from "../../../test-utils/buildIdentityTestContext"
import { RegisterTenantUseCase } from "./RegisterTenantUseCase"
import { InviteMemberUseCase } from "./InviteMemberUseCase"

function buildUseCase() {
  const ctx = buildIdentityTestContext()
  const useCase = new InviteMemberUseCase(ctx)
  return { useCase, ...ctx }
}

describe("InviteMemberUseCase", () => {
  it("should create a pending invitation that expires in 72h", async () => {
    const { useCase, clock } = buildUseCase()

    const invitation = await useCase.execute({
      tenantId: "tenant-1",
      email: "  Nova@Example.com ",
      role: "MEMBER",
    })

    expect(invitation.email).toBe("nova@example.com")
    expect(invitation.status).toBe("PENDING")
    expect(invitation.expiresAt.getTime() - clock.now().getTime()).toBe(72 * 60 * 60 * 1000)
  })

  it("should refresh an existing pending invitation instead of duplicating it", async () => {
    const { useCase, invitationRepository } = buildUseCase()

    const first = await useCase.execute({
      tenantId: "tenant-1",
      email: "nova@example.com",
      role: "MEMBER",
    })
    const second = await useCase.execute({
      tenantId: "tenant-1",
      email: "nova@example.com",
      role: "ADMIN",
    })

    expect(second.id).toBe(first.id)
    expect(second.role).toBe("ADMIN")
    const stored = await invitationRepository.findPendingByTenantAndEmail(
      "tenant-1",
      "nova@example.com",
    )
    expect(stored?.role).toBe("ADMIN")
  })

  it("should reject inviting someone who is already a member of the tenant", async () => {
    const { useCase, ...ctx } = buildUseCase()
    const register = new RegisterTenantUseCase(ctx)
    const { tenantId } = await register.execute({
      email: "marina@example.com",
      password: "Senha123",
      tenantName: "X",
    })

    await expect(
      useCase.execute({ tenantId, email: "marina@example.com", role: "MEMBER" }),
    ).rejects.toThrow(MembershipAlreadyExistsError)
  })
})
