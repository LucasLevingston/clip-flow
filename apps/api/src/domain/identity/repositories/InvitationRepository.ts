export interface InvitationRecord {
  id: string
  tenantId: string
  email: string
  role: "ADMIN" | "MEMBER"
  status: "PENDING" | "ACCEPTED" | "EXPIRED"
  expiresAt: Date
  createdAt: Date
}

export interface InvitationRepository {
  findPendingByTenantAndEmail(tenantId: string, email: string): Promise<InvitationRecord | null>
  save(record: InvitationRecord): Promise<void>
}
