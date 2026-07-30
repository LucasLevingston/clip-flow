import { createQueueProducer } from "@clip-flow/worker-kit"
import type { Queue } from "bullmq"
import type {
  VideoContentEventPublisher,
  VideoContentGeneratedEvent,
} from "../../domain/content-generation/services/VideoContentEventPublisher"

/** Publishes onto the `video` queue — same contract the AI Worker uses on approval-path parity. */
export class BullMqVideoContentEventPublisher implements VideoContentEventPublisher {
  private readonly queue: Queue

  constructor(queue: Queue = createQueueProducer("video")) {
    this.queue = queue
  }

  async publishContentGenerated(event: VideoContentGeneratedEvent): Promise<void> {
    await this.queue.add("VideoContentGenerated", event)
  }
}
