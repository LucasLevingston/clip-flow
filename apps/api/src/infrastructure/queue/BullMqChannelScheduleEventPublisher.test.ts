import type { Queue } from "bullmq"
import { BullMqChannelScheduleEventPublisher } from "./BullMqChannelScheduleEventPublisher"

function buildQueue() {
  const add = jest.fn().mockResolvedValue(undefined)
  return { queue: { add } as unknown as Queue, add }
}

describe("BullMqChannelScheduleEventPublisher", () => {
  it("should fan out a RegisterChannelJob to both the scheduler and analytics queues", async () => {
    const scheduler = buildQueue()
    const analytics = buildQueue()
    const publisher = new BullMqChannelScheduleEventPublisher(scheduler.queue, analytics.queue)
    const event = { channelId: "channel-1", tenantId: "tenant-1", generationTime: "06:00" }

    await publisher.registerChannel(event)

    expect(scheduler.add).toHaveBeenCalledWith("RegisterChannelJob", event)
    expect(analytics.add).toHaveBeenCalledWith("RegisterChannelJob", event)
  })

  it("should fan out a RemoveChannelJob to both the scheduler and analytics queues", async () => {
    const scheduler = buildQueue()
    const analytics = buildQueue()
    const publisher = new BullMqChannelScheduleEventPublisher(scheduler.queue, analytics.queue)

    await publisher.removeChannel("channel-1", "tenant-1")

    const payload = { channelId: "channel-1", tenantId: "tenant-1" }
    expect(scheduler.add).toHaveBeenCalledWith("RemoveChannelJob", payload)
    expect(analytics.add).toHaveBeenCalledWith("RemoveChannelJob", payload)
  })
})
