import { useQuery } from "@tanstack/react-query"
import { videosService } from "../services/videosService"
import { videoKeys } from "./queryKeys"
import type { VideoFilters } from "../types"

export function useVideos(page: number, pageSize: number, filters: VideoFilters) {
  return useQuery({
    queryKey: videoKeys.list(page, pageSize, filters),
    queryFn: () => videosService.listVideos(page, pageSize, filters),
  })
}
