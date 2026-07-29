import type { Tenant } from "../entities/Tenant"

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>
  save(tenant: Tenant): Promise<void>
}
