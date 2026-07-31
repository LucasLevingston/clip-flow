import { useQuery } from "@tanstack/react-query"
import { channelsService } from "../services/channelsService"
import { channelKeys } from "./queryKeys"

export function useChannels() {
  return useQuery({
    queryKey: channelKeys.list(),
    queryFn: () => channelsService.listChannels(),
  })
}
