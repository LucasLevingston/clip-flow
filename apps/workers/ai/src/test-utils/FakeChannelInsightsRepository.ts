import type { ChannelInsightsRepository } from "../domain/repositories/ChannelInsightsRepository"
import type { ChannelInsightsSnapshot } from "../domain/types"

export class FakeChannelInsightsRepository implements ChannelInsightsRepository {
  private readonly insightsByChannelId = new Map<string, ChannelInsightsSnapshot>()

  seed(channelId: string, insights: ChannelInsightsSnapshot): void {
    this.insightsByChannelId.set(channelId, insights)
  }

  findByChannelId(channelId: string): Promise<ChannelInsightsSnapshot | null> {
    return Promise.resolve(this.insightsByChannelId.get(channelId) ?? null)
  }
}
