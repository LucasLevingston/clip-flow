import type { Queue } from "bullmq"
import { BullMqRepeatableJobScheduler } from "./BullMqRepeatableJobScheduler"

function buildQueue() {
  const upsertJobScheduler = jest.fn().mockResolvedValue(undefined)
  const removeJobScheduler = jest.fn().mockResolvedValue(true)
  return {
    queue: { upsertJobScheduler, removeJobScheduler } as unknown as Queue,
    upsertJobScheduler,
    removeJobScheduler,
  }
}

describe("BullMqRepeatableJobScheduler", () => {
  it("should upsert a job scheduler with the given interval and template", async () => {
    const { queue, upsertJobScheduler } = buildQueue()
    const scheduler = new BullMqRepeatableJobScheduler(queue)

    await scheduler.upsertRepeatable("sched-1", 21_600_000, "CollectAnalytics", {
      publishRecordId: "record-1",
    })

    expect(upsertJobScheduler).toHaveBeenCalledWith(
      "sched-1",
      { every: 21_600_000 },
      { name: "CollectAnalytics", data: { publishRecordId: "record-1" } },
    )
  })

  it("should remove a job scheduler by id", async () => {
    const { queue, removeJobScheduler } = buildQueue()
    const scheduler = new BullMqRepeatableJobScheduler(queue)

    await scheduler.removeRepeatable("sched-1")

    expect(removeJobScheduler).toHaveBeenCalledWith("sched-1")
  })
})
