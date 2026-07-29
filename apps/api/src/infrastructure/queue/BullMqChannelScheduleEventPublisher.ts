import { createQueueProducer } from "@clip-flow/worker-kit"
import type { Queue } from "bullmq"
import type {
  ChannelScheduleEventPublisher,
  RegisterChannelScheduleEvent,
} from "../../domain/channel-management/services/ChannelScheduleEventPublisher"

/** Publishes onto the `scheduler` queue — see ADR-0010, the queue itself is the event bus. */
export class BullMqChannelScheduleEventPublisher implements ChannelScheduleEventPublisher {
  private readonly queue: Queue

  constructor(queue: Queue = createQueueProducer("scheduler")) {
    this.queue = queue
  }

  async registerChannel(event: RegisterChannelScheduleEvent): Promise<void> {
    await this.queue.add("RegisterChannelJob", event)
  }

  async removeChannel(channelId: string, tenantId: string): Promise<void> {
    await this.queue.add("RemoveChannelJob", { channelId, tenantId })
  }
}
