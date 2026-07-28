import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"

/**
 * Consumes the `analytics` queue. Real metrics collection + ChannelInsights
 * recalculation (CollectAnalyticsUseCase, UpdateChannelInsightsUseCase)
 * land in EPIC-09 — see docs/workers/analytics-worker.md.
 */
export function startAnalyticsQueueConsumer(): Worker {
  return createQueueWorker("analytics", (job: Job) => {
    console.log(`[analytics] received job ${job.id}`)
    return Promise.resolve()
  })
}
