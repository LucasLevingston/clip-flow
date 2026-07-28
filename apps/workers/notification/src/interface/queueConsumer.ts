import { createQueueWorker } from "@clip-flow/worker-kit";
import type { Job, Worker } from "bullmq";

/**
 * Consumes the `notification` queue. Real in-app/e-mail dispatch
 * (SendNotificationUseCase) lands in EPIC-08 — see
 * docs/workers/notification-worker.md.
 */
export function startNotificationQueueConsumer(): Worker {
  return createQueueWorker("notification", (job: Job) => {
    console.log(`[notification] received job ${job.id}`);
    return Promise.resolve();
  });
}
