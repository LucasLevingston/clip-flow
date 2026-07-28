import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"

/**
 * Consumes the `ai` queue. Real transcription/highlight-selection/copy
 * logic (GenerateVideoContentUseCase) lands in EPIC-06 — see
 * docs/workers/ai-worker.md.
 */
export function startAiQueueConsumer(): Worker {
  return createQueueWorker("ai", (job: Job) => {
    console.log(`[ai] received job ${job.id}`)
    return Promise.resolve()
  })
}
