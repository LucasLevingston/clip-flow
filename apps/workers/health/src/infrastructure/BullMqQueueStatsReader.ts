import type { Queue } from "bullmq"
import type { QueueStatsReader } from "../domain/services/QueueStatsReader"
import type { QueueName, QueueStats } from "../domain/types"

const RECENT_EXECUTION_SAMPLE_SIZE = 100

export class BullMqQueueStatsReader implements QueueStatsReader {
  constructor(private readonly queues: Record<QueueName, Queue>) {}

  async getStats(queueName: QueueName): Promise<QueueStats> {
    const queue = this.queues[queueName]
    const [counts, recentCompleted, recentFailed] = await Promise.all([
      queue.getJobCounts("waiting", "active", "failed"),
      queue.getJobs(["completed"], 0, RECENT_EXECUTION_SAMPLE_SIZE - 1),
      queue.getJobs(["failed"], 0, RECENT_EXECUTION_SAMPLE_SIZE - 1),
    ])

    const totalRecent = recentCompleted.length + recentFailed.length
    const recentFailureRate = totalRecent > 0 ? recentFailed.length / totalRecent : 0

    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      failed: counts.failed ?? 0,
      recentFailureRate,
    }
  }
}
