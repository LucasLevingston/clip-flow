import type { QueueName, QueueStats } from "../types"

export interface QueueStatsReader {
  getStats(queueName: QueueName): Promise<QueueStats>
}
