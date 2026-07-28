import { Worker, type Processor, type WorkerOptions } from "bullmq";
import IORedis from "ioredis";

/**
 * Every Clip Flow worker consumes exactly one named queue (see
 * architecture/worker-flow.md). This factory centralizes the Redis
 * connection setup BullMQ requires (`maxRetriesPerRequest: null`) so each
 * worker's main.ts only supplies its queue name and processor.
 */
export function createQueueWorker(
  queueName: string,
  processor: Processor,
  options?: Partial<WorkerOptions>,
): Worker {
  const connection = new IORedis(
    process.env.REDIS_URL ?? "redis://localhost:6379",
    {
      maxRetriesPerRequest: null,
    },
  );

  return new Worker(queueName, processor, { ...options, connection });
}
