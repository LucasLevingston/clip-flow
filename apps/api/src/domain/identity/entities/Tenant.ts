import { InvalidTimezoneError } from "../errors/InvalidTimezoneError"

export interface TenantProps {
  id: string
  name: string
  timezone: string
  createdAt: Date
}

function isValidIanaTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/** Aggregate root — see domain/aggregates-repositories-factories.md. */
export class Tenant {
  private constructor(private readonly props: TenantProps) {}

  static create(props: { id: string; name: string; timezone: string; createdAt?: Date }): Tenant {
    const name = props.name.trim()
    if (!name) {
      throw new Error("Tenant name must not be empty")
    }
    if (!isValidIanaTimezone(props.timezone)) {
      throw new InvalidTimezoneError(props.timezone)
    }
    return new Tenant({ ...props, name, createdAt: props.createdAt ?? new Date() })
  }

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get timezone(): string {
    return this.props.timezone
  }

  get createdAt(): Date {
    return this.props.createdAt
  }
}
