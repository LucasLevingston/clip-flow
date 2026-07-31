import { useQuery } from "@tanstack/react-query"
import { contentSourceConfigService } from "../services/contentSourceConfigService"
import { adminNichesKeys } from "./queryKeys"

export function useContentSourcesAdmin(nicheId: string) {
  return useQuery({
    queryKey: adminNichesKeys.contentSources(nicheId),
    queryFn: () => contentSourceConfigService.listContentSources(nicheId),
    enabled: Boolean(nicheId),
  })
}
