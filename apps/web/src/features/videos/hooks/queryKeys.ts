import type { VideoFilters } from "../types"

export const videoKeys = {
  all: ["videos"] as const,
  lists: () => [...videoKeys.all, "list"] as const,
  list: (page: number, pageSize: number, filters: VideoFilters) =>
    [...videoKeys.lists(), page, pageSize, filters] as const,
}
