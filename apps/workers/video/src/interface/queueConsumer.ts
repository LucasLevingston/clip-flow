import { createQueueWorker } from "@clip-flow/worker-kit"
import type { Job, Worker } from "bullmq"

/**
 * Consumes the `video` queue. Real cut/reframe/thumbnail logic
 * (CutVideoUseCase) lands in EPIC-06 — see docs/workers/video-worker.md.
 */
export function startVideoQueueConsumer(): Worker {
  return createQueueWorker("video", (job: Job) => {
    console.log(`[video] received job ${job.id}`)
    return Promise.resolve()
  })
}
