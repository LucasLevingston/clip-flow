import type { ChannelRepository, ChannelSnapshot } from "../domain/repositories/ChannelRepository"

export class FakeChannelRepository implements ChannelRepository {
  private readonly channelsById = new Map<string, ChannelSnapshot>()

  seed(channel: ChannelSnapshot): void {
    this.channelsById.set(channel.id, channel)
  }

  findById(channelId: string): Promise<ChannelSnapshot | null> {
    return Promise.resolve(this.channelsById.get(channelId) ?? null)
  }
}
