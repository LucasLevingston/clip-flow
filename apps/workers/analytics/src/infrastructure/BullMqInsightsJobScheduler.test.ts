import type { Queue } from "bullmq"
import { BullMqInsightsJobScheduler } from "./BullMqInsightsJobScheduler"

function buildQueue() {
  const upsertJobScheduler = jest.fn().mockResolvedValue(undefined)
  const removeJobScheduler = jest.fn().mockResolvedValue(true)
  return {
    queue: { upsertJobScheduler, removeJobScheduler } as unknown as Queue,
    upsertJobScheduler,
    removeJobScheduler,
  }
}

describe("BullMqInsightsJobScheduler", () => {
  it("should register a daily cron job 30 minutes before generationTime, keyed by channel", async () => {
    const { queue, upsertJobScheduler } = buildQueue()
    const scheduler = new BullMqInsightsJobScheduler(queue)

    await scheduler.register({ channelId: "channel-1", generationTime: "06:00" })

    expect(upsertJobScheduler).toHaveBeenCalledWith(
      "channel-insights:channel-1",
      { pattern: "30 5 * * *" },
      { name: "UpdateChannelInsights", data: { channelId: "channel-1" } },
    )
  })

  it("should remove the job scheduler by channel id", async () => {
    const { queue, removeJobScheduler } = buildQueue()
    const scheduler = new BullMqInsightsJobScheduler(queue)

    await scheduler.remove("channel-1")

    expect(removeJobScheduler).toHaveBeenCalledWith("channel-insights:channel-1")
  })
})
