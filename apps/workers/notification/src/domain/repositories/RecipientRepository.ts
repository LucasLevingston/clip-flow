export interface RecipientRepository {
  findTenantMemberUserIds(tenantId: string): Promise<string[]>
  findPlatformAdminUserIds(): Promise<string[]>
  findUserEmail(userId: string): Promise<string | null>
}
