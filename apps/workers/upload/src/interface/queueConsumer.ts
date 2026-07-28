import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"

/**
 * Consumes the `upload` queue. Real publish/fan-out/idempotency logic
 * (PublishVideoUseCase) lands in EPIC-07 — see docs/workers/upload-worker.md.
 */
export function startUploadQueueConsumer(): Worker {
  return createQueueWorker("upload", (job: Job) => {
    console.log(`[upload] received job ${job.id}`)
    return Promise.resolve()
  })
}
