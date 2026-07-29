import { Membership } from "../../../domain/identity/entities/Membership"
import { InvitationExpiredError } from "../../../domain/identity/errors/InvitationExpiredError"
import { MembershipAlreadyExistsError } from "../../../domain/identity/errors/MembershipAlreadyExistsError"
import type { InvitationRepository } from "../../../domain/identity/repositories/InvitationRepository"
import type { MembershipRepository } from "../../../domain/identity/repositories/MembershipRepository"
import type { UserRepository } from "../../../domain/identity/repositories/UserRepository"
import type { MembershipRole } from "../../../domain/identity/types"
import type { Clock } from "../../../domain/identity/services/Clock"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"

export interface AcceptInvitationInput {
  tenantId: string
  userId: string
}

export interface AcceptInvitationOutput {
  tenantId: string
  role: MembershipRole
}

export interface AcceptInvitationUseCaseDeps {
  invitationRepository: InvitationRepository
  membershipRepository: MembershipRepository
  userRepository: UserRepository
  idGenerator: IdGenerator
  clock: Clock
}

/** RF-02 — the invitation is matched by the caller's own verified e-mail, never by a client-supplied token. */
export class AcceptInvitationUseCase {
  constructor(private readonly deps: AcceptInvitationUseCaseDeps) {}

  async execute(input: AcceptInvitationInput): Promise<AcceptInvitationOutput> {
    const user = await this.deps.userRepository.findById(input.userId)
    if (!user) {
      throw new InvitationExpiredError()
    }

    const invitation = await this.deps.invitationRepository.findPendingByTenantAndEmail(
      input.tenantId,
      user.email.value,
    )
    if (!invitation || invitation.expiresAt.getTime() < this.deps.clock.now().getTime()) {
      throw new InvitationExpiredError()
    }

    const existingMembership = await this.deps.membershipRepository.findByTenantAndUser(
      input.tenantId,
      user.id,
    )
    if (existingMembership) {
      throw new MembershipAlreadyExistsError(user.email.value)
    }

    const membership = Membership.create({
      id: this.deps.idGenerator.generate(),
      tenantId: input.tenantId,
      userId: user.id,
      role: invitation.role,
      createdAt: this.deps.clock.now(),
    })
    await this.deps.membershipRepository.save(membership)
    await this.deps.invitationRepository.save({ ...invitation, status: "ACCEPTED" })

    return { tenantId: input.tenantId, role: membership.role }
  }
}
