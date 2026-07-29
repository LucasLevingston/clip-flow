import type {
  InvitationRecord,
  InvitationRepository,
} from "../../domain/identity/repositories/InvitationRepository"

export class InMemoryInvitationRepository implements InvitationRepository {
  private readonly recordsById = new Map<string, InvitationRecord>()

  findPendingByTenantAndEmail(tenantId: string, email: string): Promise<InvitationRecord | null> {
    for (const record of this.recordsById.values()) {
      if (record.tenantId === tenantId && record.email === email && record.status === "PENDING") {
        return Promise.resolve(record)
      }
    }
    return Promise.resolve(null)
  }

  save(record: InvitationRecord): Promise<void> {
    this.recordsById.set(record.id, record)
    return Promise.resolve()
  }
}
