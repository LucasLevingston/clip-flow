import { useQuery } from "@tanstack/react-query"
import { channelsService } from "../services/channelsService"
import { channelKeys } from "./queryKeys"

export function useChannelInsights(channelId: string) {
  return useQuery({
    queryKey: channelKeys.insights(channelId),
    queryFn: () => channelsService.getChannelInsights(channelId),
    enabled: Boolean(channelId),
  })
}
