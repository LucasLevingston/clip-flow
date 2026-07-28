import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"

/**
 * Consumes the `scheduler` queue. Real batch-generation trigger logic
 * (TriggerDailyGenerationUseCase) lands in EPIC-06 — see
 * docs/workers/scheduler-worker.md.
 */
export function startSchedulerQueueConsumer(): Worker {
  return createQueueWorker("scheduler", (job: Job) => {
    console.log(`[scheduler] received job ${job.id}`)
    return Promise.resolve()
  })
}
