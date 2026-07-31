import { createQueueProducer } from "@clip-flow/worker-kit"
import type { Queue } from "bullmq"
import type {
  ChannelScheduleEventPublisher,
  RegisterChannelScheduleEvent,
} from "../../domain/channel-management/services/ChannelScheduleEventPublisher"

/**
 * Publishes onto the `scheduler` queue (ADR-0010) and, since Sprint 10, also onto the `analytics`
 * queue so the Analytics Worker keeps its daily ChannelInsights recalculation job in sync.
 */
export class BullMqChannelScheduleEventPublisher implements ChannelScheduleEventPublisher {
  constructor(
    private readonly schedulerQueue: Queue = createQueueProducer("scheduler"),
    private readonly analyticsQueue: Queue = createQueueProducer("analytics"),
  ) {}

  async registerChannel(event: RegisterChannelScheduleEvent): Promise<void> {
    await Promise.all([
      this.schedulerQueue.add("RegisterChannelJob", event),
      this.analyticsQueue.add("RegisterChannelJob", event),
    ])
  }

  async removeChannel(channelId: string, tenantId: string): Promise<void> {
    await Promise.all([
      this.schedulerQueue.add("RemoveChannelJob", { channelId, tenantId }),
      this.analyticsQueue.add("RemoveChannelJob", { channelId, tenantId }),
    ])
  }
}
