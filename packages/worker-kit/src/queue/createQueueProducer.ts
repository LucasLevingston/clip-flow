import { Queue, type QueueOptions } from "bullmq"
import IORedis from "ioredis"

/** EPIC-11 (Error Recovery) — every job gets 3 attempts with exponential backoff unless a caller overrides it. */
const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
} as const

/**
 * Producer counterpart to `createQueueWorker` — used by services that enqueue
 * jobs onto a worker's named queue without consuming it themselves (e.g. the
 * API publishing channel-lifecycle events onto the `scheduler` queue).
 */
export function createQueueProducer(queueName: string, options?: Partial<QueueOptions>): Queue {
  const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  })

  return new Queue(queueName, {
    ...options,
    defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, ...options?.defaultJobOptions },
    connection,
  })
}
