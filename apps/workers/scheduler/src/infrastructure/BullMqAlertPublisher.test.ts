import type { Queue } from "bullmq"
import { BullMqAlertPublisher } from "./BullMqAlertPublisher"

describe("BullMqAlertPublisher", () => {
  it("should add an InsufficientSourceVideoPool job with the alert payload", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqAlertPublisher(queue)
    const alert = {
      channelId: "channel-1",
      tenantId: "tenant-1",
      requiredCount: 2,
      availableCount: 1,
    }

    await publisher.publishInsufficientPool(alert)

    expect(add).toHaveBeenCalledWith("InsufficientSourceVideoPool", alert)
  })
})
