import type {
  VideoNotificationPublisher,
  VideoProcessingFailedEvent,
} from "../domain/services/VideoNotificationPublisher"

export class FakeVideoNotificationPublisher implements VideoNotificationPublisher {
  failed: VideoProcessingFailedEvent[] = []

  publishProcessingFailed(event: VideoProcessingFailedEvent): Promise<void> {
    this.failed.push(event)
    return Promise.resolve()
  }
}
