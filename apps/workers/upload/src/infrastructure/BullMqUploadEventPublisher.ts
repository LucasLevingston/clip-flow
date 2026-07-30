import type { Queue } from "bullmq"
import type {
  SocialAccountNeedsReauthEvent,
  UploadEventPublisher,
  VideoPublishedEvent,
  VideoPublishFailedEvent,
} from "../domain/services/UploadEventPublisher"

/** VideoPublished fans out to both `notification` and `analytics` (event-flow.md). */
export class BullMqUploadEventPublisher implements UploadEventPublisher {
  constructor(
    private readonly notificationQueue: Queue,
    private readonly analyticsQueue: Queue,
  ) {}

  async publishVideoPublished(event: VideoPublishedEvent): Promise<void> {
    await Promise.all([
      this.notificationQueue.add("VideoPublished", event),
      this.analyticsQueue.add("VideoPublished", event),
    ])
  }

  async publishVideoPublishFailed(event: VideoPublishFailedEvent): Promise<void> {
    await this.notificationQueue.add("VideoPublishFailed", event)
  }

  async publishSocialAccountNeedsReauth(event: SocialAccountNeedsReauthEvent): Promise<void> {
    await this.notificationQueue.add("SocialAccountNeedsReauth", event)
  }
}
