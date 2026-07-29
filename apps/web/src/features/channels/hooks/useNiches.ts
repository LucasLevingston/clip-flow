import { useQuery } from "@tanstack/react-query"
import { channelsService } from "../services/channelsService"
import { channelKeys } from "./queryKeys"

export function useNiches() {
  return useQuery({
    queryKey: channelKeys.niches(),
    queryFn: channelsService.listNiches,
  })
}
