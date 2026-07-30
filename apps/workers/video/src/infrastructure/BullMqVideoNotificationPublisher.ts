import type { Queue } from "bullmq"
import type {
  VideoNotificationPublisher,
  VideoProcessingFailedEvent,
} from "../domain/services/VideoNotificationPublisher"

export class BullMqVideoNotificationPublisher implements VideoNotificationPublisher {
  constructor(private readonly queue: Queue) {}

  async publishProcessingFailed(event: VideoProcessingFailedEvent): Promise<void> {
    await this.queue.add("VideoProcessingFailed", event)
  }
}
