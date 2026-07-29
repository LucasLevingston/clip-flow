import type {
  ChannelScheduleEventPublisher,
  RegisterChannelScheduleEvent,
} from "../../domain/channel-management/services/ChannelScheduleEventPublisher"

export class FakeChannelScheduleEventPublisher implements ChannelScheduleEventPublisher {
  readonly registered: RegisterChannelScheduleEvent[] = []
  readonly removed: { channelId: string; tenantId: string }[] = []

  registerChannel(event: RegisterChannelScheduleEvent): Promise<void> {
    this.registered.push(event)
    return Promise.resolve()
  }

  removeChannel(channelId: string, tenantId: string): Promise<void> {
    this.removed.push({ channelId, tenantId })
    return Promise.resolve()
  }
}
