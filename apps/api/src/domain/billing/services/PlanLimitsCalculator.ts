import type { Plan } from "../entities/Plan"

export interface ChannelUsage {
  current: number
  max: number
}

/** RF-08 — the only limit already checkable pre-Sprint-3 (Channel bounded context) is channel count. */
export class PlanLimitsCalculator {
  calculateChannelUsage(plan: Plan, currentChannelCount: number): ChannelUsage {
    return { current: currentChannelCount, max: plan.maxChannels }
  }

  exceedsChannelLimit(plan: Plan, currentChannelCount: number): boolean {
    return currentChannelCount > plan.maxChannels
  }
}
