import { useQuery } from "@tanstack/react-query"
import { channelsService } from "../services/channelsService"
import { channelKeys } from "./queryKeys"

export function useChannel(channelId: string) {
  return useQuery({
    queryKey: channelKeys.detail(channelId),
    queryFn: () => channelsService.getChannel(channelId),
    enabled: Boolean(channelId),
  })
}
