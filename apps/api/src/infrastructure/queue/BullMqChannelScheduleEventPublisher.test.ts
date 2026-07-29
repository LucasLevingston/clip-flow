import type { Queue } from "bullmq"
import { BullMqChannelScheduleEventPublisher } from "./BullMqChannelScheduleEventPublisher"

describe("BullMqChannelScheduleEventPublisher", () => {
  it("should add a RegisterChannelJob with the event payload", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqChannelScheduleEventPublisher(queue)
    const event = { channelId: "channel-1", tenantId: "tenant-1", generationTime: "06:00" }

    await publisher.registerChannel(event)

    expect(add).toHaveBeenCalledWith("RegisterChannelJob", event)
  })

  it("should add a RemoveChannelJob with the channel and tenant ids", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqChannelScheduleEventPublisher(queue)

    await publisher.removeChannel("channel-1", "tenant-1")

    expect(add).toHaveBeenCalledWith("RemoveChannelJob", {
      channelId: "channel-1",
      tenantId: "tenant-1",
    })
  })
})
