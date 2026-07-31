import { useQuery } from "@tanstack/react-query"
import { adminNichesService, type ListSourceVideosParams } from "../services/adminNichesService"
import { adminNichesKeys } from "./queryKeys"

export function useSourceVideosAdmin(params: ListSourceVideosParams = {}) {
  return useQuery({
    queryKey: [...adminNichesKeys.sourceVideos(), params],
    queryFn: () => adminNichesService.listSourceVideos(params),
  })
}
