import type { Membership } from "../entities/Membership"

export interface MembershipRepository {
  findByTenantAndUser(tenantId: string, userId: string): Promise<Membership | null>
  findByTenantId(tenantId: string): Promise<Membership[]>
  /** Ordered oldest-first — see LoginUseCase for how the "current tenant" is picked. */
  findByUserId(userId: string): Promise<Membership[]>
  save(membership: Membership): Promise<void>
}
