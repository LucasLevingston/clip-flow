import { apiClient } from "@/lib/apiClient"
import { buildQueryString } from "@/lib/buildQueryString"
import type { ListVideosResult, VideoFilters } from "../types"

export const videosService = {
  listVideos: (page: number, pageSize: number, filters: VideoFilters): Promise<ListVideosResult> =>
    apiClient.get<ListVideosResult>(
      `/v1/videos${buildQueryString({ page, pageSize, ...filters })}`,
    ),
  exportVideosUrl: (filters: VideoFilters): string =>
    `/v1/videos/export${buildQueryString({ ...filters })}`,
}
