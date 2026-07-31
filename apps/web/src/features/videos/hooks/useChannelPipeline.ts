import { useQuery } from "@tanstack/react-query"
import { videosService } from "../services/videosService"
import { videoKeys } from "./queryKeys"

const POLL_INTERVAL_MS = 5_000

/** RF-13 — powers the tenant-facing real-time pipeline panel; polls every 5s while mounted. */
export function useChannelPipeline(channelId: string) {
  return useQuery({
    queryKey: videoKeys.pipeline(channelId),
    queryFn: () => videosService.getChannelPipeline(channelId),
    enabled: Boolean(channelId),
    refetchInterval: POLL_INTERVAL_MS,
  })
}
