import type { MembershipRole } from "../types"

export interface MembershipProps {
  id: string
  tenantId: string
  userId: string
  role: MembershipRole
  createdAt: Date
}

/**
 * The "at least one OWNER per tenant" invariant spans multiple Membership
 * rows, so it cannot live here — it is enforced by TenantFactory (creation)
 * and by the use case that would remove/demote the last OWNER.
 */
export class Membership {
  private constructor(private readonly props: MembershipProps) {}

  static create(props: {
    id: string
    tenantId: string
    userId: string
    role: MembershipRole
    createdAt?: Date
  }): Membership {
    return new Membership({ ...props, createdAt: props.createdAt ?? new Date() })
  }

  get id(): string {
    return this.props.id
  }

  get tenantId(): string {
    return this.props.tenantId
  }

  get userId(): string {
    return this.props.userId
  }

  get role(): MembershipRole {
    return this.props.role
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  isOwner(): boolean {
    return this.props.role === "OWNER"
  }
}
