import { collectionSchedulerId } from "../../domain/services/collectionSchedulerId"
import { FakeRepeatableJobScheduler } from "../../test-utils/FakeRepeatableJobScheduler"
import { ScheduleAnalyticsCollectionUseCase } from "./ScheduleAnalyticsCollectionUseCase"

describe("ScheduleAnalyticsCollectionUseCase", () => {
  it("should upsert a 6h repeatable job keyed by publish record id", async () => {
    const repeatableJobScheduler = new FakeRepeatableJobScheduler()
    const useCase = new ScheduleAnalyticsCollectionUseCase({ repeatableJobScheduler })

    await useCase.execute({ publishRecordId: "record-1" })

    expect(repeatableJobScheduler.upserted).toEqual([
      {
        schedulerId: collectionSchedulerId("record-1"),
        everyMs: 6 * 60 * 60 * 1_000,
        jobName: "CollectAnalytics",
        data: { publishRecordId: "record-1" },
      },
    ])
  })
})
