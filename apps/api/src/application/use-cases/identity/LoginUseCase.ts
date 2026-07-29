import { InvalidCredentialsError } from "../../../domain/identity/errors/InvalidCredentialsError"
import type { MembershipRepository } from "../../../domain/identity/repositories/MembershipRepository"
import type { UserRepository } from "../../../domain/identity/repositories/UserRepository"
import type { PasswordHasher } from "../../../domain/identity/services/PasswordHasher"
import type { IssuedSession, SessionIssuer } from "../../services/SessionIssuer"

export interface LoginInput {
  email: string
  password: string
}

export interface LoginOutput extends IssuedSession {
  userId: string
  tenantId: string
}

export interface LoginUseCaseDeps {
  userRepository: UserRepository
  membershipRepository: MembershipRepository
  passwordHasher: PasswordHasher
  sessionIssuer: SessionIssuer
}

/**
 * RF-01. A user can belong to more than one tenant (e.g. invited into a
 * second one) — login picks the oldest membership as the "current tenant".
 * Switching tenants mid-session is out of scope for this sprint.
 */
export class LoginUseCase {
  constructor(private readonly deps: LoginUseCaseDeps) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.deps.userRepository.findByEmail(input.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await this.deps.passwordHasher.compare(
      input.password,
      user.passwordHash,
    )
    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const memberships = await this.deps.membershipRepository.findByUserId(user.id)
    const currentMembership = memberships[0]
    if (!currentMembership) {
      throw new InvalidCredentialsError()
    }

    const session = await this.deps.sessionIssuer.issue({
      userId: user.id,
      tenantId: currentMembership.tenantId,
      role: currentMembership.role,
      isPlatformAdmin: user.isPlatformAdmin,
    })

    return { ...session, userId: user.id, tenantId: currentMembership.tenantId }
  }
}
