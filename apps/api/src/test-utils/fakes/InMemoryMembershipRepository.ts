import type { Membership } from "../../domain/identity/entities/Membership"
import type { MembershipRepository } from "../../domain/identity/repositories/MembershipRepository"

export class InMemoryMembershipRepository implements MembershipRepository {
  private readonly memberships: Membership[] = []

  findByTenantAndUser(tenantId: string, userId: string): Promise<Membership | null> {
    const found = this.memberships.find((m) => m.tenantId === tenantId && m.userId === userId)
    return Promise.resolve(found ?? null)
  }

  /* istanbul ignore next -- reserved for the member-listing use case (ISSUE-01.F2), not yet built */
  findByTenantId(tenantId: string): Promise<Membership[]> {
    return Promise.resolve(this.memberships.filter((m) => m.tenantId === tenantId))
  }

  findByUserId(userId: string): Promise<Membership[]> {
    const found = this.memberships
      .filter((m) => m.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    return Promise.resolve(found)
  }

  save(membership: Membership): Promise<void> {
    const index = this.memberships.findIndex((m) => m.id === membership.id)
    if (index >= 0) {
      this.memberships[index] = membership
    } else {
      this.memberships.push(membership)
    }
    return Promise.resolve()
  }
}
