import { apiClient } from "@/lib/apiClient"
import { buildQueryString } from "@/lib/buildQueryString"
import type { AnalyticsSummary } from "../types"

export const analyticsService = {
  getSummary: (channelId: string): Promise<AnalyticsSummary> =>
    apiClient.get<AnalyticsSummary>(`/v1/analytics/summary${buildQueryString({ channelId })}`),
}
