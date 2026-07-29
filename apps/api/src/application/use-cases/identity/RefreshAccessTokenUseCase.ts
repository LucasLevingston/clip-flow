import { RefreshTokenInvalidError } from "../../../domain/identity/errors/RefreshTokenInvalidError"
import type { MembershipRepository } from "../../../domain/identity/repositories/MembershipRepository"
import type { RefreshTokenRepository } from "../../../domain/identity/repositories/RefreshTokenRepository"
import type { UserRepository } from "../../../domain/identity/repositories/UserRepository"
import type { Clock } from "../../../domain/identity/services/Clock"
import type { RefreshTokenHasher } from "../../../domain/identity/services/RefreshTokenHasher"
import type { IssuedSession, SessionIssuer } from "../../services/SessionIssuer"

export interface RefreshAccessTokenInput {
  refreshToken: string
}

export interface RefreshAccessTokenUseCaseDeps {
  refreshTokenRepository: RefreshTokenRepository
  refreshTokenHasher: RefreshTokenHasher
  userRepository: UserRepository
  membershipRepository: MembershipRepository
  sessionIssuer: SessionIssuer
  clock: Clock
}

/** Rotates the refresh token on every use (security/authentication-authorization.md). */
export class RefreshAccessTokenUseCase {
  constructor(private readonly deps: RefreshAccessTokenUseCaseDeps) {}

  async execute(input: RefreshAccessTokenInput): Promise<IssuedSession> {
    const tokenHash = this.deps.refreshTokenHasher.hash(input.refreshToken)
    const record = await this.deps.refreshTokenRepository.findByTokenHash(tokenHash)

    if (
      !record ||
      record.revokedAt ||
      record.expiresAt.getTime() < this.deps.clock.now().getTime()
    ) {
      throw new RefreshTokenInvalidError()
    }

    const user = await this.deps.userRepository.findById(record.userId)
    const memberships = user ? await this.deps.membershipRepository.findByUserId(user.id) : []
    const currentMembership = memberships[0]

    if (!user || !currentMembership) {
      throw new RefreshTokenInvalidError()
    }

    await this.deps.refreshTokenRepository.revoke(record.id)

    return this.deps.sessionIssuer.issue({
      userId: user.id,
      tenantId: currentMembership.tenantId,
      role: currentMembership.role,
      isPlatformAdmin: user.isPlatformAdmin,
    })
  }
}
