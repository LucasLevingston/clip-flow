import { Email } from "../value-objects/Email"

export interface UserProps {
  id: string
  email: Email
  passwordHash: string
  isPlatformAdmin: boolean
  createdAt: Date
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: {
    id: string
    email: string
    passwordHash: string
    isPlatformAdmin?: boolean
    createdAt?: Date
  }): User {
    return new User({
      id: props.id,
      email: Email.create(props.email),
      passwordHash: props.passwordHash,
      isPlatformAdmin: props.isPlatformAdmin ?? false,
      createdAt: props.createdAt ?? new Date(),
    })
  }

  get id(): string {
    return this.props.id
  }

  get email(): Email {
    return this.props.email
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  get isPlatformAdmin(): boolean {
    return this.props.isPlatformAdmin
  }

  get createdAt(): Date {
    return this.props.createdAt
  }
}
