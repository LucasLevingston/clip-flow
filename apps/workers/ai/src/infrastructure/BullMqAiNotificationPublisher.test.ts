import type { Queue } from "bullmq"
import { BullMqAiNotificationPublisher } from "./BullMqAiNotificationPublisher"

describe("BullMqAiNotificationPublisher", () => {
  it("should add a VideoFlaggedForModeration job with the event payload", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqAiNotificationPublisher(queue)
    const event = { generatedVideoId: "generated-1", flagReason: "violence" }

    await publisher.publishFlaggedForModeration(event)

    expect(add).toHaveBeenCalledWith("VideoFlaggedForModeration", event)
  })

  it("should add a VideoContentGenerationFailed job with the event payload", async () => {
    const add = jest.fn().mockResolvedValue(undefined)
    const queue = { add } as unknown as Queue
    const publisher = new BullMqAiNotificationPublisher(queue)
    const event = { generatedVideoId: "generated-1", reason: "whisper timed out" }

    await publisher.publishGenerationFailed(event)

    expect(add).toHaveBeenCalledWith("VideoContentGenerationFailed", event)
  })
})
