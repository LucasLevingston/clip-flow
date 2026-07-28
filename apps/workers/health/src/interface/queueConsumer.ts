import { createQueueWorker } from "@clip-flow/worker-kit";
import type { Job, Worker } from "bullmq";

/**
 * Consumes the `health` queue (control/trigger jobs only — the actual
 * queue/integration monitoring loop is cron-driven, not queue-driven; see
 * docs/workers/health-worker.md). Real CheckPlatformHealthUseCase lands in
 * EPIC-10.
 */
export function startHealthQueueConsumer(): Worker {
  return createQueueWorker("health", (job: Job) => {
    console.log(`[health] received job ${job.id}`);
    return Promise.resolve();
  });
}
