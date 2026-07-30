import type {
  AnalyticsSnapshotRepository,
  CreateAnalyticsSnapshotInput,
} from "../domain/repositories/AnalyticsSnapshotRepository"

export class FakeAnalyticsSnapshotRepository implements AnalyticsSnapshotRepository {
  readonly created: CreateAnalyticsSnapshotInput[] = []

  create(input: CreateAnalyticsSnapshotInput): Promise<void> {
    this.created.push(input)
    return Promise.resolve()
  }
}
