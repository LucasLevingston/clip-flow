import type { TenantResolver } from "../domain/services/TenantResolver"

export class FakeTenantResolver implements TenantResolver {
  private readonly tenantIdByChannelId = new Map<string, string>()
  private readonly tenantIdByGeneratedVideoId = new Map<string, string>()

  seedChannel(channelId: string, tenantId: string): void {
    this.tenantIdByChannelId.set(channelId, tenantId)
  }

  seedGeneratedVideo(generatedVideoId: string, tenantId: string): void {
    this.tenantIdByGeneratedVideoId.set(generatedVideoId, tenantId)
  }

  resolveTenantIdByChannelId(channelId: string): Promise<string | null> {
    return Promise.resolve(this.tenantIdByChannelId.get(channelId) ?? null)
  }

  resolveTenantIdByGeneratedVideoId(generatedVideoId: string): Promise<string | null> {
    return Promise.resolve(this.tenantIdByGeneratedVideoId.get(generatedVideoId) ?? null)
  }
}
