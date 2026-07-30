import type { Queue } from "bullmq"
import { BullMqUploadEventPublisher } from "./BullMqUploadEventPublisher"

function buildQueue() {
  const add = jest.fn().mockResolvedValue(undefined)
  return { queue: { add } as unknown as Queue, add }
}

describe("BullMqUploadEventPublisher", () => {
  it("should add a VideoPublished job to both the notification and analytics queues", async () => {
    const notification = buildQueue()
    const analytics = buildQueue()
    const publisher = new BullMqUploadEventPublisher(notification.queue, analytics.queue)
    const event = {
      generatedVideoId: "generated-1",
      publishRecordId: "record-1",
      platform: "YOUTUBE" as const,
    }

    await publisher.publishVideoPublished(event)

    expect(notification.add).toHaveBeenCalledWith("VideoPublished", event)
    expect(analytics.add).toHaveBeenCalledWith("VideoPublished", event)
  })

  it("should add a VideoPublishFailed job only to the notification queue", async () => {
    const notification = buildQueue()
    const analytics = buildQueue()
    const publisher = new BullMqUploadEventPublisher(notification.queue, analytics.queue)
    const event = { generatedVideoId: "generated-1", platform: "TIKTOK" as const, reason: "boom" }

    await publisher.publishVideoPublishFailed(event)

    expect(notification.add).toHaveBeenCalledWith("VideoPublishFailed", event)
    expect(analytics.add).not.toHaveBeenCalled()
  })

  it("should add a SocialAccountNeedsReauth job only to the notification queue", async () => {
    const notification = buildQueue()
    const analytics = buildQueue()
    const publisher = new BullMqUploadEventPublisher(notification.queue, analytics.queue)
    const event = { channelId: "channel-1", socialAccountId: "account-1" }

    await publisher.publishSocialAccountNeedsReauth(event)

    expect(notification.add).toHaveBeenCalledWith("SocialAccountNeedsReauth", event)
    expect(analytics.add).not.toHaveBeenCalled()
  })
})
