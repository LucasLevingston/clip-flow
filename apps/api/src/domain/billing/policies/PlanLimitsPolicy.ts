import type { Plan } from "../entities/Plan"

/** RF-08 — decides whether a plan-gated action is allowed, given the current plan and usage. */
export class PlanLimitsPolicy {
  canCreateChannel(plan: Plan, currentChannelCount: number): boolean {
    return currentChannelCount < plan.maxChannels
  }

  isVideosPerDayWithinLimit(plan: Plan, videosPerDay: number): boolean {
    return videosPerDay <= plan.maxVideosPerDayPerChannel
  }
}
