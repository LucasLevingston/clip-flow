import type { Queue } from "bullmq"
import { BullMqVideoNotificationPublisher } from "./BullMqVideoNotificationPublisher"

describe("BullMqVideoNotificationPublisher", () => {
  it("should add a VideoProcessingFailed job with the event payload", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqVideoNotificationPublisher(queue)
    const event = { generatedVideoId: "generated-1", reason: "ffmpeg exited 1" }

    await publisher.publishProcessingFailed(event)

    expect(add).toHaveBeenCalledWith("VideoProcessingFailed", event)
  })
})
