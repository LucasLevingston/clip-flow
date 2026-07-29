import type { Queue } from "bullmq"
import { BullMqVideoContentEventPublisher } from "./BullMqVideoContentEventPublisher"

describe("BullMqVideoContentEventPublisher", () => {
  it("should add a VideoContentGenerated job with the event payload", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqVideoContentEventPublisher(queue)
    const event = { generatedVideoId: "generated-1" }

    await publisher.publishContentGenerated(event)

    expect(add).toHaveBeenCalledWith("VideoContentGenerated", event)
  })
})
