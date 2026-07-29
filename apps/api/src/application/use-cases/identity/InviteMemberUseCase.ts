import { Email } from "../../../domain/identity/value-objects/Email"
import { MembershipAlreadyExistsError } from "../../../domain/identity/errors/MembershipAlreadyExistsError"
import type {
  InvitationRecord,
  InvitationRepository,
} from "../../../domain/identity/repositories/InvitationRepository"
import type { MembershipRepository } from "../../../domain/identity/repositories/MembershipRepository"
import type { UserRepository } from "../../../domain/identity/repositories/UserRepository"
import type { Clock } from "../../../domain/identity/services/Clock"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"

const INVITATION_TTL_MS = 72 * 60 * 60 * 1000

export interface InviteMemberInput {
  tenantId: string
  email: string
  role: "ADMIN" | "MEMBER"
}

export interface InviteMemberUseCaseDeps {
  invitationRepository: InvitationRepository
  membershipRepository: MembershipRepository
  userRepository: UserRepository
  idGenerator: IdGenerator
  clock: Clock
}

/** RF-02 — re-inviting the same e-mail refreshes the existing pending invitation instead of duplicating it. */
export class InviteMemberUseCase {
  constructor(private readonly deps: InviteMemberUseCaseDeps) {}

  async execute(input: InviteMemberInput): Promise<InvitationRecord> {
    const email = Email.create(input.email).value

    const existingUser = await this.deps.userRepository.findByEmail(email)
    if (existingUser) {
      const membership = await this.deps.membershipRepository.findByTenantAndUser(
        input.tenantId,
        existingUser.id,
      )
      if (membership) {
        throw new MembershipAlreadyExistsError(email)
      }
    }

    const existingInvitation = await this.deps.invitationRepository.findPendingByTenantAndEmail(
      input.tenantId,
      email,
    )

    const invitation: InvitationRecord = {
      id: existingInvitation?.id ?? this.deps.idGenerator.generate(),
      tenantId: input.tenantId,
      email,
      role: input.role,
      status: "PENDING",
      expiresAt: new Date(this.deps.clock.now().getTime() + INVITATION_TTL_MS),
      createdAt: existingInvitation?.createdAt ?? this.deps.clock.now(),
    }

    await this.deps.invitationRepository.save(invitation)

    return invitation
  }
}
