/**
 * Reads channel usage from the not-yet-built Channel bounded context (EPIC-02.F2 /
 * Sprint 3). Kept as a minimal port so Billing can check plan limits today —
 * the Prisma implementation queries the `channel` table directly since the
 * table already exists even though the Channel domain layer does not yet.
 */
export interface ChannelUsageProvider {
  countByTenant(tenantId: string): Promise<number>
}
