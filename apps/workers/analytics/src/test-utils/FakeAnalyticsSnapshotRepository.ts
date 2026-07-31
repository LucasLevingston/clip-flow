import type {
  AnalyticsSnapshotRepository,
  CreateAnalyticsSnapshotInput,
} from "../domain/repositories/AnalyticsSnapshotRepository"
import type { ChannelPerformanceRecord } from "../domain/types"

export class FakeAnalyticsSnapshotRepository implements AnalyticsSnapshotRepository {
  readonly created: CreateAnalyticsSnapshotInput[] = []
  private readonly historyByChannelId = new Map<string, ChannelPerformanceRecord[]>()

  create(input: CreateAnalyticsSnapshotInput): Promise<void> {
    this.created.push(input)
    return Promise.resolve()
  }

  seedHistory(channelId: string, records: ChannelPerformanceRecord[]): void {
    this.historyByChannelId.set(channelId, records)
  }

  findByChannelId(channelId: string): Promise<ChannelPerformanceRecord[]> {
    return Promise.resolve(this.historyByChannelId.get(channelId) ?? [])
  }
}
