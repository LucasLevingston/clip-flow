import type { ChannelStatus } from "../types"

/** Pre-condition 2/4 — RF-14: DRAFT/PAUSED channels never fire the daily batch. */
export class IsChannelActiveSpecification {
  isSatisfiedBy(status: ChannelStatus): boolean {
    return status === "ACTIVE"
  }
}
