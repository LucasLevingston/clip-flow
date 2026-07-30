import type { RecipientRepository } from "../domain/repositories/RecipientRepository"

export class FakeRecipientRepository implements RecipientRepository {
  private readonly tenantMembers = new Map<string, string[]>()
  private readonly emails = new Map<string, string>()
  platformAdminUserIds: string[] = []

  seedTenantMembers(tenantId: string, userIds: string[]): void {
    this.tenantMembers.set(tenantId, userIds)
  }

  seedEmail(userId: string, email: string): void {
    this.emails.set(userId, email)
  }

  findTenantMemberUserIds(tenantId: string): Promise<string[]> {
    return Promise.resolve(this.tenantMembers.get(tenantId) ?? [])
  }

  findPlatformAdminUserIds(): Promise<string[]> {
    return Promise.resolve(this.platformAdminUserIds)
  }

  findUserEmail(userId: string): Promise<string | null> {
    return Promise.resolve(this.emails.get(userId) ?? null)
  }
}
