import type { Channel } from "../../../domain/channel-management/entities/Channel"
import type { ChannelScheduleEventPublisher } from "../../../domain/channel-management/services/ChannelScheduleEventPublisher"

/** Registers the channel's repeatable job when ACTIVE, removes it otherwise — reflects current state, not the mutation. */
export async function publishChannelScheduleEvent(
  channel: Channel,
  publisher: ChannelScheduleEventPublisher,
): Promise<void> {
  if (channel.status === "ACTIVE") {
    await publisher.registerChannel({
      channelId: channel.id,
      tenantId: channel.tenantId,
      generationTime: channel.generationTime.format(),
    })
    return
  }
  await publisher.removeChannel(channel.id, channel.tenantId)
}
