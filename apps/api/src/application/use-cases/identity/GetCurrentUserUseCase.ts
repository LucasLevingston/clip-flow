import type { MembershipRepository } from "../../../domain/identity/repositories/MembershipRepository"
import type { TenantRepository } from "../../../domain/identity/repositories/TenantRepository"
import type { UserRepository } from "../../../domain/identity/repositories/UserRepository"
import type { MembershipRole } from "../../../domain/identity/types"

export interface GetCurrentUserInput {
  userId: string
  tenantId: string
}

export interface GetCurrentUserOutput {
  user: { id: string; email: string; isPlatformAdmin: boolean }
  tenant: { id: string; name: string }
  role: MembershipRole
}

export interface GetCurrentUserUseCaseDeps {
  userRepository: UserRepository
  tenantRepository: TenantRepository
  membershipRepository: MembershipRepository
}

/** Backs `GET /v1/auth/me` — all three lookups are by primary key from the JWT claims. */
export class GetCurrentUserUseCase {
  constructor(private readonly deps: GetCurrentUserUseCaseDeps) {}

  async execute(input: GetCurrentUserInput): Promise<GetCurrentUserOutput | null> {
    const [user, tenant, membership] = await Promise.all([
      this.deps.userRepository.findById(input.userId),
      this.deps.tenantRepository.findById(input.tenantId),
      this.deps.membershipRepository.findByTenantAndUser(input.tenantId, input.userId),
    ])

    if (!user || !tenant || !membership) {
      return null
    }

    return {
      user: { id: user.id, email: user.email.value, isPlatformAdmin: user.isPlatformAdmin },
      tenant: { id: tenant.id, name: tenant.name },
      role: membership.role,
    }
  }
}
