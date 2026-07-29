import type { Queue } from "bullmq"
import type {
  AiNotificationPublisher,
  VideoContentGenerationFailedEvent,
  VideoFlaggedForModerationEvent,
} from "../domain/services/AiNotificationPublisher"

export class BullMqAiNotificationPublisher implements AiNotificationPublisher {
  constructor(private readonly queue: Queue) {}

  async publishFlaggedForModeration(event: VideoFlaggedForModerationEvent): Promise<void> {
    await this.queue.add("VideoFlaggedForModeration", event)
  }

  async publishGenerationFailed(event: VideoContentGenerationFailedEvent): Promise<void> {
    await this.queue.add("VideoContentGenerationFailed", event)
  }
}
