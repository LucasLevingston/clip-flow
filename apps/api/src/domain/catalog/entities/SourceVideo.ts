import { InvalidSourceVideoStatusTransitionError } from "../errors/InvalidSourceVideoStatusTransitionError"
import type { SourceVideoStatus } from "../types"
import type { LicenseInfo } from "../value-objects/LicenseInfo"

export interface SourceVideoProps {
  id: string
  nicheId: string
  durationSeconds: number
  license: LicenseInfo
  status: SourceVideoStatus
  storageUrl: string
  createdAt: Date
}

/** RF-07 — ADR-0006: never constructible without a `LicenseInfo`, so no unlicensed source ever exists. */
export class SourceVideo {
  private constructor(private readonly props: SourceVideoProps) {}

  static create(
    props: Omit<SourceVideoProps, "status" | "createdAt"> & {
      status?: SourceVideoStatus
      createdAt?: Date
    },
  ): SourceVideo {
    return new SourceVideo({
      ...props,
      status: props.status ?? "PENDING_REVIEW",
      createdAt: props.createdAt ?? new Date(),
    })
  }

  get id(): string {
    return this.props.id
  }

  get nicheId(): string {
    return this.props.nicheId
  }

  get durationSeconds(): number {
    return this.props.durationSeconds
  }

  get license(): LicenseInfo {
    return this.props.license
  }

  get status(): SourceVideoStatus {
    return this.props.status
  }

  get storageUrl(): string {
    return this.props.storageUrl
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  approve(): SourceVideo {
    if (this.props.status !== "PENDING_REVIEW") {
      throw new InvalidSourceVideoStatusTransitionError(this.props.status, "APPROVED")
    }
    return new SourceVideo({ ...this.props, status: "APPROVED" })
  }

  reject(): SourceVideo {
    if (this.props.status !== "PENDING_REVIEW") {
      throw new InvalidSourceVideoStatusTransitionError(this.props.status, "REJECTED")
    }
    return new SourceVideo({ ...this.props, status: "REJECTED" })
  }
}
