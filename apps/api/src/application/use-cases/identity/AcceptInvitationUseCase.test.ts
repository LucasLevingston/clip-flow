import { Membership } from "../../../domain/identity/entities/Membership"
import { InvitationExpiredError } from "../../../domain/identity/errors/InvitationExpiredError"
import { MembershipAlreadyExistsError } from "../../../domain/identity/errors/MembershipAlreadyExistsError"
import { buildIdentityTestContext } from "../../../test-utils/buildIdentityTestContext"
import { AcceptInvitationUseCase } from "./AcceptInvitationUseCase"
import { InviteMemberUseCase } from "./InviteMemberUseCase"
import { RegisterTenantUseCase } from "./RegisterTenantUseCase"

async function buildScenario() {
  const ctx = buildIdentityTestContext()
  const register = new RegisterTenantUseCase(ctx)
  const invite = new InviteMemberUseCase(ctx)
  const useCase = new AcceptInvitationUseCase(ctx)

  const owner = await register.execute({
    email: "owner@example.com",
    password: "Senha123",
    tenantName: "Studio",
  })
  const invitee = await register.execute({
    email: "invitee@example.com",
    password: "Senha123",
    tenantName: "Invitee Co",
  })

  return { useCase, invite, owner, invitee, ...ctx }
}

describe("AcceptInvitationUseCase", () => {
  it("should create a membership matching the invitation's role and mark it accepted", async () => {
    const { useCase, invite, owner, invitee, membershipRepository, invitationRepository } =
      await buildScenario()
    await invite.execute({ tenantId: owner.tenantId, email: "invitee@example.com", role: "ADMIN" })

    const result = await useCase.execute({ tenantId: owner.tenantId, userId: invitee.userId })

    expect(result).toEqual({ tenantId: owner.tenantId, role: "ADMIN" })
    const membership = await membershipRepository.findByTenantAndUser(
      owner.tenantId,
      invitee.userId,
    )
    expect(membership?.role).toBe("ADMIN")
    const stillPending = await invitationRepository.findPendingByTenantAndEmail(
      owner.tenantId,
      "invitee@example.com",
    )
    expect(stillPending).toBeNull()
  })

  it("should reject when there is no pending invitation for that tenant/e-mail", async () => {
    const { useCase, owner, invitee } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: owner.tenantId, userId: invitee.userId }),
    ).rejects.toThrow(InvitationExpiredError)
  })

  it("should reject an expired invitation", async () => {
    const { useCase, invite, owner, invitee, clock } = await buildScenario()
    await invite.execute({ tenantId: owner.tenantId, email: "invitee@example.com", role: "MEMBER" })
    clock.advanceMs(73 * 60 * 60 * 1000)

    await expect(
      useCase.execute({ tenantId: owner.tenantId, userId: invitee.userId }),
    ).rejects.toThrow(InvitationExpiredError)
  })

  it("should reject when the user already has a membership despite a still-pending invitation", async () => {
    const {
      useCase,
      owner,
      invitee,
      clock,
      idGenerator,
      membershipRepository,
      invitationRepository,
    } = await buildScenario()
    await membershipRepository.save(
      Membership.create({
        id: idGenerator.generate(),
        tenantId: owner.tenantId,
        userId: invitee.userId,
        role: "MEMBER",
        createdAt: clock.now(),
      }),
    )
    await invitationRepository.save({
      id: idGenerator.generate(),
      tenantId: owner.tenantId,
      email: "invitee@example.com",
      role: "ADMIN",
      status: "PENDING",
      expiresAt: new Date(clock.now().getTime() + 1000),
      createdAt: clock.now(),
    })

    await expect(
      useCase.execute({ tenantId: owner.tenantId, userId: invitee.userId }),
    ).rejects.toThrow(MembershipAlreadyExistsError)
  })

  it("should reject when the authenticated user no longer exists", async () => {
    const { useCase, owner } = await buildScenario()

    await expect(
      useCase.execute({ tenantId: owner.tenantId, userId: "ghost-user-id" }),
    ).rejects.toThrow(InvitationExpiredError)
  })
})
