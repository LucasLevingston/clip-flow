export interface PlanProps {
  id: string
  name: string
  maxChannels: number
  maxVideosPerDayPerChannel: number
  priceCents: number
  stripePriceId: string | null
}

export class Plan {
  private constructor(private readonly props: PlanProps) {}

  static create(props: PlanProps): Plan {
    return new Plan(props)
  }

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get maxChannels(): number {
    return this.props.maxChannels
  }

  get maxVideosPerDayPerChannel(): number {
    return this.props.maxVideosPerDayPerChannel
  }

  get priceCents(): number {
    return this.props.priceCents
  }

  get stripePriceId(): string | null {
    return this.props.stripePriceId
  }
}
