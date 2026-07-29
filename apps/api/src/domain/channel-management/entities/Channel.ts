import { InvalidChannelStatusTransitionError } from "../errors/InvalidChannelStatusTransitionError"
import { PublishTimesCountMismatchError } from "../errors/PublishTimesCountMismatchError"
import type { TimeOfDay } from "../value-objects/TimeOfDay"

export type ChannelPlatforms = "SHORTS_ONLY" | "TIKTOK_ONLY" | "BOTH"
export type ChannelStatus = "DRAFT" | "ACTIVE" | "PAUSED"

export interface ChannelProps {
  id: string
  tenantId: string
  nicheId: string
  name: string
  language: string
  promptOverride: string | null
  videosPerDay: number
  publishTimes: TimeOfDay[]
  generationTime: TimeOfDay
  platforms: ChannelPlatforms
  thumbnailEnabled: boolean
  status: ChannelStatus
  createdAt: Date
}

export type ChannelConfigInput = Pick<
  ChannelProps,
  | "name"
  | "language"
  | "promptOverride"
  | "videosPerDay"
  | "publishTimes"
  | "generationTime"
  | "platforms"
  | "thumbnailEnabled"
>

/** Aggregate root — see domain/entities-value-objects.md and ADR-0011. `nicheId` has no setter: immutable by construction. */
export class Channel {
  private constructor(private readonly props: ChannelProps) {}

  static create(
    props: Omit<ChannelProps, "status" | "createdAt"> & {
      status?: ChannelStatus
      createdAt?: Date
    },
  ): Channel {
    if (props.publishTimes.length !== props.videosPerDay) {
      throw new PublishTimesCountMismatchError(props.videosPerDay, props.publishTimes.length)
    }
    return new Channel({
      ...props,
      status: props.status ?? "DRAFT",
      createdAt: props.createdAt ?? new Date(),
    })
  }

  get id(): string {
    return this.props.id
  }

  get tenantId(): string {
    return this.props.tenantId
  }

  get nicheId(): string {
    return this.props.nicheId
  }

  get name(): string {
    return this.props.name
  }

  get language(): string {
    return this.props.language
  }

  get promptOverride(): string | null {
    return this.props.promptOverride
  }

  get videosPerDay(): number {
    return this.props.videosPerDay
  }

  get publishTimes(): TimeOfDay[] {
    return this.props.publishTimes
  }

  get generationTime(): TimeOfDay {
    return this.props.generationTime
  }

  get platforms(): ChannelPlatforms {
    return this.props.platforms
  }

  get thumbnailEnabled(): boolean {
    return this.props.thumbnailEnabled
  }

  get status(): ChannelStatus {
    return this.props.status
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  updateConfig(config: ChannelConfigInput): Channel {
    return Channel.create({ ...this.props, ...config, status: this.props.status })
  }

  activate(): Channel {
    if (this.props.status === "ACTIVE") {
      throw new InvalidChannelStatusTransitionError(this.props.status, "ACTIVE")
    }
    return new Channel({ ...this.props, status: "ACTIVE" })
  }

  pause(): Channel {
    if (this.props.status !== "ACTIVE") {
      throw new InvalidChannelStatusTransitionError(this.props.status, "PAUSED")
    }
    return new Channel({ ...this.props, status: "PAUSED" })
  }
}
