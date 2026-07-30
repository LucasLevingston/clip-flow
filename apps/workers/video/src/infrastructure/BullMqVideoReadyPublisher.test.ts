import type { Queue } from "bullmq"
import { BullMqVideoReadyPublisher } from "./BullMqVideoReadyPublisher"

describe("BullMqVideoReadyPublisher", () => {
  it("should add a VideoReadyToPublish job with the given delay", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqVideoReadyPublisher(queue)
    const event = { generatedVideoId: "generated-1" }

    await publisher.publish(event, 30_000)

    expect(add).toHaveBeenCalledWith("VideoReadyToPublish", event, { delay: 30_000 })
  })
})
