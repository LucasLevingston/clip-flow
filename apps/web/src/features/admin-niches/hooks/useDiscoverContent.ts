import { useMutation, useQueryClient } from "@tanstack/react-query"
import { contentSourceConfigService } from "../services/contentSourceConfigService"
import { adminNichesKeys } from "./queryKeys"

export function useDiscoverContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nicheId: string) => contentSourceConfigService.discoverContent(nicheId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminNichesKeys.sourceVideos() })
    },
  })
}
