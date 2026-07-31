import type { ChannelInsightsResult } from "../types"

export interface ChannelInsightsUpsertInput extends ChannelInsightsResult {
  channelId: string
  computedAt: Date
}

/** Upsert-only — ChannelInsights is always reconstructible from AnalyticsSnapshot, never edited by hand. */
export interface ChannelInsightsRepository {
  upsert(input: ChannelInsightsUpsertInput): Promise<void>
}
