import { Worker, type Processor, type WorkerOptions, type Job } from "bullmq"
import IORedis from "ioredis"
import { createQueueProducer } from "./createQueueProducer"

/**
 * Every Clip Flow worker consumes exactly one named queue (see
 * architecture/worker-flow.md). This factory centralizes the Redis
 * connection setup BullMQ requires (`maxRetriesPerRequest: null`) so each
 * worker's main.ts only supplies its queue name and processor. Also wires
 * dead-letter forwarding (EPIC-11) — a job that exhausts every retry lands
 * on `<queueName>-dlq` for manual inspection instead of silently vanishing.
 */
export function createQueueWorker(
  queueName: string,
  processor: Processor,
  options?: Partial<WorkerOptions>,
): Worker {
  const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  })

  const worker = new Worker(queueName, processor, { ...options, connection })
  attachDeadLetterForwarding(worker, queueName)
  return worker
}

function attachDeadLetterForwarding(worker: Worker, queueName: string): void {
  const deadLetterQueue = createQueueProducer(`${queueName}-dlq`)

  worker.on("failed", (job: Job | undefined, error: Error) => {
    if (!job || job.attemptsMade < (job.opts.attempts ?? 1)) {
      return
    }
    void deadLetterQueue.add(job.name, {
      originalJobId: job.id,
      data: job.data as unknown,
      failedReason: error.message,
      attemptsMade: job.attemptsMade,
    })
  })
}
