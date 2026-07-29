import type { AuditActorType } from "../types"

export interface AuditLogProps {
  id: string
  actorUserId: string | null
  actorType: AuditActorType
  action: string
  targetType: string
  targetId: string
  metadata: Record<string, unknown> | null
  createdAt: Date
}

/** Immutable, append-only — every platform-admin action is traceable (RF-15). */
export class AuditLog {
  private constructor(private readonly props: AuditLogProps) {}

  static create(props: Omit<AuditLogProps, "createdAt"> & { createdAt?: Date }): AuditLog {
    return new AuditLog({ ...props, createdAt: props.createdAt ?? new Date() })
  }

  get id(): string {
    return this.props.id
  }

  get actorUserId(): string | null {
    return this.props.actorUserId
  }

  get actorType(): AuditActorType {
    return this.props.actorType
  }

  get action(): string {
    return this.props.action
  }

  get targetType(): string {
    return this.props.targetType
  }

  get targetId(): string {
    return this.props.targetId
  }

  get metadata(): Record<string, unknown> | null {
    return this.props.metadata
  }

  get createdAt(): Date {
    return this.props.createdAt
  }
}
