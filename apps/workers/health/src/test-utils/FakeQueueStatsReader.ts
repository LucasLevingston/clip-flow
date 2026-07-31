import type { QueueStatsReader } from "../domain/services/QueueStatsReader"
import type { QueueName, QueueStats } from "../domain/types"

const DEFAULT_STATS: QueueStats = { waiting: 0, active: 0, failed: 0, recentFailureRate: 0 }

export class FakeQueueStatsReader implements QueueStatsReader {
  private readonly statsByQueue = new Map<QueueName, QueueStats>()

  seed(queueName: QueueName, stats: QueueStats): void {
    this.statsByQueue.set(queueName, stats)
  }

  getStats(queueName: QueueName): Promise<QueueStats> {
    return Promise.resolve(this.statsByQueue.get(queueName) ?? DEFAULT_STATS)
  }
}
