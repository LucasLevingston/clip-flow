import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"
import { createAnalyticsWorkerDeps } from "../infrastructure/createAnalyticsWorkerDeps"

/**
 * Consumes the `analytics` queue. `VideoPublished` (fanned out by the Upload
 * Worker) schedules the repeatable `CollectAnalytics` job; `CollectAnalytics`
 * itself runs one collection tick. `ChannelInsights` recalculation lands in
 * Sprint 10 — see docs/workers/analytics-worker.md.
 */
export function startAnalyticsQueueConsumer(): Worker {
  const { scheduleAnalyticsCollectionUseCase, collectAnalyticsUseCase } =
    createAnalyticsWorkerDeps()

  return createQueueWorker("analytics", async (job: Job<{ publishRecordId: string }>) => {
    if (job.name === "VideoPublished") {
      await scheduleAnalyticsCollectionUseCase.execute({
        publishRecordId: job.data.publishRecordId,
      })
      return
    }
    if (job.name === "CollectAnalytics") {
      await collectAnalyticsUseCase.execute({ publishRecordId: job.data.publishRecordId })
    }
  })
}
