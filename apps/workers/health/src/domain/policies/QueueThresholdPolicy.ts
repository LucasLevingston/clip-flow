import { FAILURE_RATE_THRESHOLD, SUSTAINED_CYCLES_THRESHOLD, WAITING_THRESHOLD } from "../constants"

export type QueueAlertSeverity = "NORMAL" | "HIGH"
export type QueueAlertReason = "SUSTAINED_BACKLOG" | "HIGH_FAILURE_RATE"

export interface QueueAlert {
  reason: QueueAlertReason
  severity: QueueAlertSeverity
}

export interface QueueThresholdCheckInput {
  waiting: number
  recentFailureRate: number
  consecutiveCyclesOverThreshold: number
}

/**
 * docs/workers/health-worker.md — `waiting > 50` sustained 5 cycles (the Health
 * Worker ticks every 1 min, so 5 cycles ≈ 5 min) OR failure rate > 10% over the
 * last 100 executions (severidade alta, checked first since it's the stronger signal).
 */
export function evaluateQueueAlert(input: QueueThresholdCheckInput): QueueAlert | null {
  if (input.recentFailureRate > FAILURE_RATE_THRESHOLD) {
    return { reason: "HIGH_FAILURE_RATE", severity: "HIGH" }
  }
  if (
    input.waiting > WAITING_THRESHOLD &&
    input.consecutiveCyclesOverThreshold >= SUSTAINED_CYCLES_THRESHOLD
  ) {
    return { reason: "SUSTAINED_BACKLOG", severity: "NORMAL" }
  }
  return null
}
