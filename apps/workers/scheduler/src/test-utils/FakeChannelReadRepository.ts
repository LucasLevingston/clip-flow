import type {
  ChannelReadRepository,
  ChannelSnapshot,
} from "../domain/repositories/ChannelReadRepository"

export class FakeChannelReadRepository implements ChannelReadRepository {
  private readonly channelsById = new Map<string, ChannelSnapshot>()

  seed(channel: ChannelSnapshot): void {
    this.channelsById.set(channel.id, channel)
  }

  findById(channelId: string): Promise<ChannelSnapshot | null> {
    return Promise.resolve(this.channelsById.get(channelId) ?? null)
  }
}
