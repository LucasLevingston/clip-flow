import type {
  ChannelInsightsRepository,
  ChannelInsightsSnapshot,
} from "../../domain/channel-management/repositories/ChannelInsightsRepository"

export class InMemoryChannelInsightsRepository implements ChannelInsightsRepository {
  private readonly insightsByChannelId = new Map<string, ChannelInsightsSnapshot>()

  seed(channelId: string, insights: ChannelInsightsSnapshot): void {
    this.insightsByChannelId.set(channelId, insights)
  }

  findByChannelId(channelId: string): Promise<ChannelInsightsSnapshot | null> {
    return Promise.resolve(this.insightsByChannelId.get(channelId) ?? null)
  }
}
