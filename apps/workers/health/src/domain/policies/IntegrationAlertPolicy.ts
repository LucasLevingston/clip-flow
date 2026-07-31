import { CONSECUTIVE_FAILURES_THRESHOLD } from "../constants"

/** docs/workers/health-worker.md — 3 consecutive failed health-checks → `IntegrationDegraded`. */
export function shouldAlertIntegrationDegraded(consecutiveFailures: number): boolean {
  return consecutiveFailures >= CONSECUTIVE_FAILURES_THRESHOLD
}
