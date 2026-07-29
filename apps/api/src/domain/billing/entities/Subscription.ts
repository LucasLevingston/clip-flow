export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED"

export interface SubscriptionProps {
  id: string
  tenantId: string
  planId: string
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  createdAt: Date
}

export class Subscription {
  private constructor(private readonly props: SubscriptionProps) {}

  static create(props: SubscriptionProps): Subscription {
    return new Subscription(props)
  }

  get id(): string {
    return this.props.id
  }

  get tenantId(): string {
    return this.props.tenantId
  }

  get planId(): string {
    return this.props.planId
  }

  get status(): SubscriptionStatus {
    return this.props.status
  }

  get currentPeriodEnd(): Date | null {
    return this.props.currentPeriodEnd
  }

  get stripeCustomerId(): string | null {
    return this.props.stripeCustomerId
  }

  get stripeSubscriptionId(): string | null {
    return this.props.stripeSubscriptionId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  withPlan(planId: string): Subscription {
    return new Subscription({ ...this.props, planId })
  }

  withStatus(status: SubscriptionStatus): Subscription {
    return new Subscription({ ...this.props, status })
  }

  withStripeIds(stripeCustomerId: string, stripeSubscriptionId: string): Subscription {
    return new Subscription({ ...this.props, stripeCustomerId, stripeSubscriptionId })
  }
}
