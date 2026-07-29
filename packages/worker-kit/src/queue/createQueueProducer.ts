import { Queue, type QueueOptions } from "bullmq"
import IORedis from "ioredis"

/**
 * Producer counterpart to `createQueueWorker` — used by services that enqueue
 * jobs onto a worker's named queue without consuming it themselves (e.g. the
 * API publishing channel-lifecycle events onto the `scheduler` queue).
 */
export function createQueueProducer(queueName: string, options?: Partial<QueueOptions>): Queue {
  const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  })

  return new Queue(queueName, { ...options, connection })
}
