import type { SubscriptionRepository } from "../../../domain/billing/repositories/SubscriptionRepository"
import { EmailAlreadyExistsError } from "../../../domain/identity/errors/EmailAlreadyExistsError"
import { TenantFactory } from "../../../domain/identity/factories/TenantFactory"
import type { MembershipRepository } from "../../../domain/identity/repositories/MembershipRepository"
import type { TenantRepository } from "../../../domain/identity/repositories/TenantRepository"
import type { UserRepository } from "../../../domain/identity/repositories/UserRepository"
import type { IdGenerator } from "../../../domain/identity/services/IdGenerator"
import type { PasswordHasher } from "../../../domain/identity/services/PasswordHasher"
import { User } from "../../../domain/identity/entities/User"
import type { IssuedSession, SessionIssuer } from "../../services/SessionIssuer"

const DEFAULT_TENANT_TIMEZONE = "UTC"

export interface RegisterTenantInput {
  email: string
  password: string
  tenantName: string
}

export interface RegisterTenantOutput extends IssuedSession {
  userId: string
  tenantId: string
}

export interface RegisterTenantUseCaseDeps {
  userRepository: UserRepository
  tenantRepository: TenantRepository
  membershipRepository: MembershipRepository
  subscriptionRepository: SubscriptionRepository
  passwordHasher: PasswordHasher
  idGenerator: IdGenerator
  sessionIssuer: SessionIssuer
}

/** RF-01 — cadastro cria Tenant + Membership(OWNER) + Subscription(TRIAL) atomicamente. */
export class RegisterTenantUseCase {
  constructor(private readonly deps: RegisterTenantUseCaseDeps) {}

  async execute(input: RegisterTenantInput): Promise<RegisterTenantOutput> {
    const existing = await this.deps.userRepository.findByEmail(input.email)
    if (existing) {
      throw new EmailAlreadyExistsError(input.email)
    }

    const passwordHash = await this.deps.passwordHasher.hash(input.password)
    const user = User.create({
      id: this.deps.idGenerator.generate(),
      email: input.email,
      passwordHash,
    })

    const { tenant, ownerMembership } = TenantFactory.create({
      tenantId: this.deps.idGenerator.generate(),
      membershipId: this.deps.idGenerator.generate(),
      name: input.tenantName,
      timezone: DEFAULT_TENANT_TIMEZONE,
      ownerUserId: user.id,
    })

    await this.deps.userRepository.save(user)
    await this.deps.tenantRepository.save(tenant)
    await this.deps.membershipRepository.save(ownerMembership)
    await this.deps.subscriptionRepository.createTrialSubscription(tenant.id)

    const session = await this.deps.sessionIssuer.issue({
      userId: user.id,
      tenantId: tenant.id,
      role: ownerMembership.role,
      isPlatformAdmin: user.isPlatformAdmin,
    })

    return { ...session, userId: user.id, tenantId: tenant.id }
  }
}
