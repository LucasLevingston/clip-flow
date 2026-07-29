import type { Tenant } from "../../domain/identity/entities/Tenant"
import type { TenantRepository } from "../../domain/identity/repositories/TenantRepository"

export class InMemoryTenantRepository implements TenantRepository {
  private readonly tenantsById = new Map<string, Tenant>()

  findById(id: string): Promise<Tenant | null> {
    return Promise.resolve(this.tenantsById.get(id) ?? null)
  }

  save(tenant: Tenant): Promise<void> {
    this.tenantsById.set(tenant.id, tenant)
    return Promise.resolve()
  }
}
