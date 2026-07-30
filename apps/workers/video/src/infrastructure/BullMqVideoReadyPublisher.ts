import type { Queue } from "bullmq"
import type {
  VideoReadyPublisher,
  VideoReadyToPublishEvent,
} from "../domain/services/VideoReadyPublisher"

export class BullMqVideoReadyPublisher implements VideoReadyPublisher {
  constructor(private readonly queue: Queue) {}

  async publish(event: VideoReadyToPublishEvent, delayMs: number): Promise<void> {
    await this.queue.add("VideoReadyToPublish", event, { delay: delayMs })
  }
}
