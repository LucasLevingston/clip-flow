import type { Queue } from "bullmq"
import type {
  VideoContentEventPublisher,
  VideoContentGeneratedEvent,
} from "../domain/services/VideoContentEventPublisher"

export class BullMqVideoContentEventPublisher implements VideoContentEventPublisher {
  constructor(private readonly queue: Queue) {}

  async publishContentGenerated(event: VideoContentGeneratedEvent): Promise<void> {
    await this.queue.add("VideoContentGenerated", event)
  }
}
