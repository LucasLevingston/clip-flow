import type { Queue } from "bullmq"
import type {
  GenerationJobPublisher,
  GenerationScheduledJob,
} from "../domain/services/GenerationJobPublisher"

export class BullMqGenerationJobPublisher implements GenerationJobPublisher {
  constructor(private readonly queue: Queue) {}

  async publish(job: GenerationScheduledJob): Promise<void> {
    await this.queue.add("GenerationScheduled", job)
  }
}
