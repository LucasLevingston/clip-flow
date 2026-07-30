export interface TenantResolver {
  resolveTenantIdByChannelId(channelId: string): Promise<string | null>
  resolveTenantIdByGeneratedVideoId(generatedVideoId: string): Promise<string | null>
}
