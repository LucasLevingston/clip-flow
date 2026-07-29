import type { Queue } from "bullmq"
import { BullMqRepeatableJobRegistry } from "./BullMqRepeatableJobRegistry"

describe("BullMqRepeatableJobRegistry", () => {
  it("should upsert a job scheduler keyed by channelId with a daily cron pattern", async () => {
    const upsertJobScheduler = jest.fn().mockResolvedValue(undefined)
    const queue = { upsertJobScheduler } as unknown as Queue
    const registry = new BullMqRepeatableJobRegistry(queue)

    await registry.register({
      channelId: "channel-1",
      tenantId: "tenant-1",
      generationTime: "06:00",
    })

    expect(upsertJobScheduler).toHaveBeenCalledWith(
      "channel-1",
      { pattern: "00 06 * * *" },
      { name: "GenerationBatch", data: { channelId: "channel-1", tenantId: "tenant-1" } },
    )
  })

  it("should remove the job scheduler keyed by channelId", async () => {
    const removeJobScheduler = jest.fn().mockResolvedValue(true)
    const queue = { removeJobScheduler } as unknown as Queue
    const registry = new BullMqRepeatableJobRegistry(queue)

    await registry.remove("channel-1")

    expect(removeJobScheduler).toHaveBeenCalledWith("channel-1")
  })
})
