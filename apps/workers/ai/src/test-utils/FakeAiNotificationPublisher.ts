import type {
  AiNotificationPublisher,
  VideoContentGenerationFailedEvent,
  VideoFlaggedForModerationEvent,
} from "../domain/services/AiNotificationPublisher"

export class FakeAiNotificationPublisher implements AiNotificationPublisher {
  readonly flagged: VideoFlaggedForModerationEvent[] = []
  readonly failed: VideoContentGenerationFailedEvent[] = []

  publishFlaggedForModeration(event: VideoFlaggedForModerationEvent): Promise<void> {
    this.flagged.push(event)
    return Promise.resolve()
  }

  publishGenerationFailed(event: VideoContentGenerationFailedEvent): Promise<void> {
    this.failed.push(event)
    return Promise.resolve()
  }
}
