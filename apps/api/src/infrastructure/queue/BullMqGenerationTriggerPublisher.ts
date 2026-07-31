import { createQueueProducer } from "@clip-flow/worker-kit"
import type { Queue } from "bullmq"
import type {
  GenerationTriggerEvent,
  GenerationTriggerPublisher,
} from "../../domain/channel-management/services/GenerationTriggerPublisher"

/** Publishes onto the `scheduler` queue (ADR-0010) — same job the daily cron itself enqueues. */
export class BullMqGenerationTriggerPublisher implements GenerationTriggerPublisher {
  constructor(private readonly queue: Queue = createQueueProducer("scheduler")) {}

  async publish(event: GenerationTriggerEvent): Promise<void> {
    await this.queue.add("GenerationBatch", event)
  }
}
