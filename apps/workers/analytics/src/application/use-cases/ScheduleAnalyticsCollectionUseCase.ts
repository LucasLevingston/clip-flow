import { collectionSchedulerId } from "../../domain/services/collectionSchedulerId"
import type { RepeatableJobScheduler } from "../../domain/services/RepeatableJobScheduler"

const COLLECTION_INTERVAL_MS = 6 * 60 * 60 * 1_000

export interface ScheduleAnalyticsCollectionInput {
  publishRecordId: string
}

export interface ScheduleAnalyticsCollectionUseCaseDeps {
  repeatableJobScheduler: RepeatableJobScheduler
}

/** Triggered by `VideoPublished` — schedules a `CollectAnalytics` job every 6h (RF-13). */
export class ScheduleAnalyticsCollectionUseCase {
  constructor(private readonly deps: ScheduleAnalyticsCollectionUseCaseDeps) {}

  async execute(input: ScheduleAnalyticsCollectionInput): Promise<void> {
    await this.deps.repeatableJobScheduler.upsertRepeatable(
      collectionSchedulerId(input.publishRecordId),
      COLLECTION_INTERVAL_MS,
      "CollectAnalytics",
      { publishRecordId: input.publishRecordId },
    )
  }
}
