import type { Queue } from "bullmq"
import type { AlertPublisher, InsufficientPoolAlert } from "../domain/services/AlertPublisher"

export class BullMqAlertPublisher implements AlertPublisher {
  constructor(private readonly queue: Queue) {}

  async publishInsufficientPool(alert: InsufficientPoolAlert): Promise<void> {
    await this.queue.add("InsufficientSourceVideoPool", alert)
  }
}
