import { useQuery } from "@tanstack/react-query"
import { analyticsService } from "../services/analyticsService"
import { analyticsKeys } from "./queryKeys"

export function useAnalyticsSummary(channelId: string) {
  return useQuery({
    queryKey: analyticsKeys.summary(channelId),
    queryFn: () => analyticsService.getSummary(channelId),
    enabled: Boolean(channelId),
  })
}
