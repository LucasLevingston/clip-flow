import { Membership } from "../entities/Membership"
import { Tenant } from "../entities/Tenant"

export interface TenantCreationResult {
  tenant: Tenant
  ownerMembership: Membership
}

/**
 * Creates a Tenant with its mandatory OWNER Membership atomically — see
 * "1 OWNER obrigatório" invariant (domain/aggregates-repositories-factories.md).
 */
export class TenantFactory {
  static create(props: {
    tenantId: string
    membershipId: string
    name: string
    timezone: string
    ownerUserId: string
  }): TenantCreationResult {
    const tenant = Tenant.create({
      id: props.tenantId,
      name: props.name,
      timezone: props.timezone,
    })

    const ownerMembership = Membership.create({
      id: props.membershipId,
      tenantId: tenant.id,
      userId: props.ownerUserId,
      role: "OWNER",
    })

    return { tenant, ownerMembership }
  }
}
